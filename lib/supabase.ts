import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// 일반 클라이언트
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 여행 계획 테이블 관련 타입 및 함수
export type TravelPlan = {
  id: string;
  destination: string;
  start_date: string;
  end_date: string;
  preferences: string[];
  itinerary: any;
  image_url?: string;
  user_id?: string;
  search_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type TravelPlanUI = {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  preferences: string[];
  itinerary: any;
  imageUrl?: string;
  searchId?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 새로운 검색 결과 테이블 관련 타입 및 함수
export type SearchResult = {
  id: string;
  start_date: string;
  end_date: string;
  travel_type: string;
  interests: string[];
  results: any;
  image_url?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type SearchResultUI = {
  id: string;
  startDate: string;
  endDate: string;
  travelType: string;
  interests: string[];
  results: any;
  imageUrl?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
};

// 여행 계획 저장 함수
export async function saveTravelPlan(plan: Omit<TravelPlanUI, 'createdAt' | 'updatedAt'>): Promise<TravelPlan> {
  // UI 형식에서 DB 형식으로 변환
  const dbPlan: Partial<TravelPlan> & Pick<TravelPlan, 'destination' | 'start_date' | 'end_date' | 'preferences' | 'itinerary'> = {
    destination: plan.destination,
    start_date: plan.startDate,
    end_date: plan.endDate,
    preferences: plan.preferences,
    itinerary: plan.itinerary,
    user_id: plan.userId,
    image_url: plan.imageUrl,
    search_id: plan.searchId,
  };

  // ID가 제공된 경우 포함
  if (plan.id) {
    dbPlan.id = plan.id;
  }

  // 저장 전 디버그 로깅
  console.log('Saving travel plan:', dbPlan);

  const { data, error } = await supabase
    .from('travel_plans')
    .insert(dbPlan)
    .select()
    .single();

  if (error) {
    console.error('Error saving travel plan:', error);
    throw new Error('여행 계획을 저장하는 중 오류가 발생했습니다.');
  }

  // 저장 후 결과 로깅
  console.log('Travel plan saved:', data);

  return data as TravelPlan;
}

// ID로 여행 계획을 조회하는 함수
export async function getTravelPlanById(id: string): Promise<TravelPlan | null> {
  console.log('Fetching travel plan with ID:', id);

  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching travel plan:', error);
    return null;
  }

  console.log('Travel plan fetched:', data);
  return data as TravelPlan;
}

// DB 형식에서 UI 형식으로 변환하는 함수
export function convertToUIFormat(plan: TravelPlan): TravelPlanUI {
  return {
    id: plan.id,
    destination: plan.destination,
    startDate: plan.start_date,
    endDate: plan.end_date,
    preferences: plan.preferences,
    itinerary: plan.itinerary,
    imageUrl: plan.image_url,
    searchId: plan.search_id,
    userId: plan.user_id,
    createdAt: plan.created_at,
    updatedAt: plan.updated_at,
  };
}

// 검색 결과 저장 함수 추가
export async function saveSearchResult(search: Omit<SearchResultUI, 'createdAt' | 'updatedAt'>): Promise<SearchResult> {
  // UI 형식에서 DB 형식으로 변환
  const dbSearch: Partial<SearchResult> & Pick<SearchResult, 'start_date' | 'end_date' | 'travel_type' | 'interests' | 'results'> = {
    start_date: search.startDate,
    end_date: search.endDate,
    travel_type: search.travelType,
    interests: search.interests,
    results: search.results,
    image_url: search.imageUrl,
    user_id: search.userId,
  };

  // ID가 제공된 경우 포함
  if (search.id) {
    dbSearch.id = search.id;
  }

  // 저장 전 디버그 로깅
  console.log('Saving search result:', dbSearch);

  const { data, error } = await supabase
    .from('search_results')
    .insert(dbSearch)
    .select()
    .single();

  if (error) {
    console.error('Error saving search result:', error);
    throw new Error('검색 결과를 저장하는 중 오류가 발생했습니다.');
  }

  // 저장 후 결과 로깅
  console.log('Search result saved:', data);

  return data as SearchResult;
}

// ID로 검색 결과를 조회하는 함수
export async function getSearchResultById(id: string): Promise<SearchResult | null> {
  console.log('Fetching search result with ID:', id);

  const { data, error } = await supabase
    .from('search_results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching search result:', error);
    return null;
  }

  console.log('Search result fetched:', data);
  return data as SearchResult;
}

// 검색 결과를 UI 형식으로 변환하는 함수
export function convertSearchResultToUIFormat(search: SearchResult): SearchResultUI {
  return {
    id: search.id,
    startDate: search.start_date,
    endDate: search.end_date,
    travelType: search.travel_type,
    interests: search.interests,
    results: search.results,
    imageUrl: search.image_url,
    userId: search.user_id,
    createdAt: search.created_at,
    updatedAt: search.updated_at,
  };
}

// 특정 사용자의 모든 여행 계획을 조회하는 함수
export async function getUserTravelPlans(userId: string): Promise<TravelPlan[]> {
  const { data, error } = await supabase
    .from('travel_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user travel plans:', error);
    return [];
  }

  return data as TravelPlan[];
}
