"use server"

import { getDestinationRecommendations, generateItinerary, updateItineraryWithFeedback } from "@/lib/ai"
import {
  saveTravelPlan,
  getTravelPlanById,
  TravelPlan,
  convertToUIFormat,
  TravelPlanUI,
  saveSearchResult,
  getSearchResultById,
  SearchResult,
  convertSearchResultToUIFormat,
  SearchResultUI
} from "@/lib/supabase"
import { redirect } from "next/navigation"
import { v4 as uuidv4 } from 'uuid'
import { supabase } from "@/lib/supabase"

export async function searchDestinations(formData: FormData) {
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const travelType = formData.get("travelType") as string
  const interests = formData.get("interests") as string

  if (!startDate || !endDate || !travelType || !interests) {
    throw new Error("모든 필드를 입력해주세요.")
  }

  let searchId: string | null = null;
  try {
    const recommendations = await getDestinationRecommendations(startDate, endDate, travelType, interests)

    // UUID를 생성하여 검색 결과의 고유 ID로 사용
    searchId = uuidv4()
    console.log('Generated search ID:', searchId)

    // 검색 결과를 search_results 테이블에 저장
    // recommendations.destinations[0]?.imageUrl 와 같이 첫번째 추천 목적지의 imageUrl을 저장 시도
    const firstDestinationImage = recommendations?.destinations?.[0]?.imageUrl;

    await saveSearchResult({
      id: searchId,
      startDate,
      endDate,
      travelType,
      interests: interests.split(',').map(item => item.trim()),
      results: recommendations, // AI가 반환한 전체 결과 (각 목적지별 이미지 URL 포함 가정)
      imageUrl: firstDestinationImage, // 검색 결과 대표 이미지 (선택적)
    })
    console.log('Search result saved with ID:', searchId)
  } catch (error) {
    console.error("Error in searchDestinations:", error)
    // redirect를 여기서 호출하지 않고, 에러를 그대로 throw 합니다.
    // 필요하다면 호출하는 쪽에서 에러를 잡고 사용자에게 메시지를 보여주거나 다른 처리를 할 수 있습니다.
    throw error
  }
  // try 블록이 성공적으로 완료된 경우에만 redirect를 호출합니다.
  if (searchId) {
    redirect(`/destinations/${searchId}`)
  }
}

export async function createItinerary(
  destination: string,
  country: string,
  startDate: string,
  endDate: string,
  travelType: string,
  interests: string,
  imageUrl?: string,
  searchId?: string,
) {
  let planId: string | null = null;
  try {
    const itinerary = await generateItinerary(destination, country, startDate, endDate, travelType, interests)

    // UUID를 생성하여 여행 계획의 고유 ID로 사용
    planId = uuidv4()

    // Supabase에 여행 계획 저장
    await saveTravelPlan({
      id: planId,
      destination: `${destination}, ${country}`,
      startDate,
      endDate,
      preferences: [travelType, ...interests.split(',').map(item => item.trim())],
      itinerary,
      imageUrl,
      searchId,
      // user_id는 인증 구현 시 추가
    })
    return { success: true, planId: planId }; // 성공 시 planId 반환
  } catch (error) {
    console.error("Error in createItinerary:", error)
    return { success: false, error: (error instanceof Error ? error.message : "여행 계획 생성 중 알 수 없는 오류가 발생했습니다.") }; // 실패 시 에러 메시지 반환
  }
}

export async function getTravelPlan(id: string): Promise<TravelPlanUI> {
  try {
    const plan = await getTravelPlanById(id)
    if (!plan) {
      throw new Error("여행 계획을 찾을 수 없습니다.")
    }
    // DB 형식에서 UI 형식으로 변환
    return convertToUIFormat(plan)
  } catch (error) {
    console.error("Error in getTravelPlan:", error)
    throw error
  }
}

export async function updateItineraryWithId(planId: string, feedback: string) {
  try {
    // 기존 여행 계획 조회
    const plan = await getTravelPlanById(planId); // plan의 타입은 TravelPlan (DB 스키마)
    if (!plan) {
      throw new Error("여행 계획을 찾을 수 없습니다.");
    }

    // 피드백을 반영한 새로운 여행 계획 생성
    const updatedItinerary = await updateItineraryWithFeedback(plan.itinerary, feedback);
    
    // 디버깅을 위해 DB에서 가져온 plan의 날짜 값을 로그로 남깁니다.
    console.log('[updateItineraryWithId] Original plan fetched from DB:', { 
      id: plan.id,
      original_start_date: plan.start_date, 
      original_end_date: plan.end_date 
    });

    const newPlanId = uuidv4(); // 새로운 여행 계획 ID 생성

    const payloadForSave = {
      id: newPlanId, // 새로운 ID 사용
      destination: plan.destination,
      startDate: plan.start_date, 
      endDate: plan.end_date,     
      preferences: plan.preferences,
      itinerary: updatedItinerary, // 수정된 일정
      imageUrl: plan.image_url, 
      user_id: plan.user_id,
      searchId: plan.search_id, 
      // created_at, updated_at은 DB에서 자동 관리되거나 saveTravelPlan에서 처리
    };

    // 디버깅을 위해 saveTravelPlan에 전달할 payload를 로그로 남깁니다.
    console.log('[updateItineraryWithId] Payload for new (forked) saveTravelPlan:', payloadForSave);

    // Supabase에 새로운 여행 계획으로 저장 (insert)
    await saveTravelPlan(payloadForSave); // saveTravelPlan은 내부적으로 insert를 수행

    // 성공 시, 이전에는 itinerary를 반환했지만 이제 새로운 planId를 반환합니다.
    return { success: true, newPlanId: newPlanId }; 

  } catch (error) {
    console.error("Error in updateItineraryWithId (forking process):", error);
    // 사용자가 볼 수 있도록 좀 더 구체적인 에러 메시지를 반환하거나, 여기서 바로 redirect를 하지는 않습니다.
    // 상위 컴포넌트에서 이 에러를 잡아서 처리하도록 합니다.
    // 만약 여기서 바로 redirect를 해야 한다면, Next.js의 에러 바운더리나 다른 방식으로 처리하는 것이 좋습니다.
    // throw error; // 에러를 다시 throw하여 호출부에서 처리하도록 변경
    return { success: false, error: (error instanceof Error ? error.message : "여행 계획 수정 중 오류가 발생했습니다.") }
  }
}

export async function updateItinerary(currentItinerary: any, feedback: string) {
  try {
    const updatedItinerary = await updateItineraryWithFeedback(currentItinerary, feedback)
    return { success: true, itinerary: updatedItinerary }
  } catch (error) {
    console.error("Error in updateItinerary:", error)
    return { success: false, error: "여행 계획 수정 중 오류가 발생했습니다." }
  }
}

// 검색 결과를 가져오는 함수 추가
export async function getSearchResult(id: string): Promise<SearchResultUI> {
  try {
    const search = await getSearchResultById(id)
    if (!search) {
      throw new Error("검색 결과를 찾을 수 없습니다.")
    }
    // DB 형식에서 UI 형식으로 변환
    return convertSearchResultToUIFormat(search)
  } catch (error) {
    console.error("Error in getSearchResult:", error)
    throw error
  }
}

// 동일한 검색 조건의 여행 계획 찾기
export async function findExistingPlan(
  destination: string,
  country: string,
  startDate: string,
  endDate: string,
  travelType: string, // 사용자가 선택한 여행 유형
  interests: string,  // 쉼표로 구분된 관심사 문자열
  searchId?: string,
): Promise<string | null> {
  console.log('[findExistingPlan] Called with:', { destination, country, startDate, endDate, travelType, interests, searchId });
  try {
    console.log('Finding existing plan with criteria:', {
      destination,
      country,
      startDate,
      endDate,
      travelType,
      interests,
      searchId,
    });

    const interestsArray = interests.split(',').map(item => item.trim()).sort();
    const trimmedTravelType = travelType.trim();

    const query = supabase
      .from('travel_plans')
      .select('id, preferences') // id와 preferences 필드만 선택
      .eq('destination', `${destination}, ${country}`)
      .eq('start_date', startDate)
      .eq('end_date', endDate);
      // .eq('travel_type', travelType) // travel_type 컬럼 직접 비교 제거

    if (searchId) {
      query.eq('search_id', searchId);
    } else {
      // searchId가 제공되지 않은 경우, DB에 search_id가 NULL인 계획과 매칭
      query.is('search_id', null);
    }

    // DB 쿼리 직전 로그
    console.log('[findExistingPlan] Querying Supabase with:', query.toString()); // 실제 쿼리 객체에 따라 .toString() 등이 필요할 수 있음

    const { data: plans, error } = await query;
    console.log('[findExistingPlan] Supabase query result - error:', error, 'plans:', plans);

    if (error) {
      console.error('Error querying existing plans from DB:', error);
      return null;
    }

    if (!plans || plans.length === 0) {
      console.log('No plans found matching basic DB criteria.');
      return null;
    }

    // 후보 계획들 중에서 preferences 배열을 기준으로 정확히 일치하는 계획 필터링
    const matchingPlan = plans.find(plan => {
      if (!plan.preferences || plan.preferences.length === 0) {
        return false; // 유효하지 않은 preferences
      }
      
      // DB에 저장된 preferences: [travelType, ...interests]
      const dbTravelType = plan.preferences[0]?.trim();
      const dbInterests = plan.preferences.slice(1).map((p: string) => p.trim()).sort();

      const travelTypeMatch = dbTravelType === trimmedTravelType;
      const interestsMatch = JSON.stringify(dbInterests) === JSON.stringify(interestsArray);
      
      if (travelTypeMatch && interestsMatch) {
        console.log(`Exact match found by preferences: Plan ID ${plan.id}`);
        return true;
      }
      return false;
    });

    // 최종 반환 직전 로그
    if (matchingPlan) {
      console.log('[findExistingPlan] Returning existing plan ID:', matchingPlan.id);
      return matchingPlan.id;
    } else {
      console.log('[findExistingPlan] No existing plan found. Returning null.');
      return null;
    }
  } catch (error) {
    console.error('[findExistingPlan] Exception:', error);
    return null;
  }
}

export async function getRecentTravelPlans(limit: number = 5): Promise<TravelPlanUI[]> {
  try {
    const { data, error } = await supabase
      .from('travel_plans')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent travel plans:", error)
      throw error
    }

    if (!data) {
      return []
    }

    return data.map(convertToUIFormat)
  } catch (error) {
    console.error("Error in getRecentTravelPlans:", error)
    throw error // 또는 빈 배열 반환 등 에러 처리
  }
}

