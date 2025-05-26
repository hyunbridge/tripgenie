import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { z } from "zod"

// 여행지 추천 스키마
const destinationSchema = z.object({
  destinations: z.array(
    z.object({
      id: z.string(),
      city: z.string(),
      country: z.string(),
      summary: z.string(),
      description: z.string().max(200), // 설명 길이 제한
      rating: z.number().min(1).max(5),
      tags: z.array(z.string()),
      whyRecommended: z.string().max(150), // 추천 이유 길이 제한
      bestTimeToVisit: z.string(),
      estimatedBudget: z.string(),
      imageUrl: z.string(), // 이미지 URL 필드 추가
    }),
  ),
})

// 여행 계획 스키마
const itinerarySchema = z.object({
  destination: z.string(),
  country: z.string(),
  totalDays: z.number(),
  travelType: z.string(),
  overview: z.string(),
  days: z.array(
    z.object({
      day: z.number(),
      date: z.string(),
      title: z.string(),
      activities: z.array(
        z.object({
          time: z.string(),
          title: z.string(),
          description: z.string(),
          location: z.string(),
          estimatedCost: z.string().optional(),
          tips: z.string().optional(),
        }),
      ),
    }),
  ),
})

// 오류시 제공할 기본 여행지 데이터
const fallbackDestinations = {
  destinations: [
    {
      id: "1",
      city: "제주도",
      country: "대한민국",
      summary: "국내 최고의 휴양지, 아름다운 자연과 다양한 액티비티",
      description: "화산섬 제주도는 독특한 자연환경과 문화를 가진 한국의 대표 관광지입니다. 한라산, 올레길, 해변 등 다양한 자연 명소와 체험거리가 있습니다.",
      rating: 4.7,
      tags: ["자연", "휴양", "문화", "음식"],
      whyRecommended: "국내여행으로 부담 없이 다양한 자연과 문화를 체험할 수 있으며, 가족 모두가 즐길 수 있는 액티비티가 풍부합니다.",
      bestTimeToVisit: "4월-6월, 9월-10월",
      estimatedBudget: "500,000원",
      imageUrl: "https://images.unsplash.com/photo-1546632891-c0905cfc4a8b?q=80&w=1000", // 제주도 이미지
    },
    {
      id: "2",
      city: "도쿄",
      country: "일본",
      summary: "전통과 현대가 공존하는 매력적인 대도시",
      description: "일본의 수도 도쿄는 첨단 기술과 전통 문화가 조화를 이루는 독특한 도시입니다. 다양한 쇼핑, 음식, 엔터테인먼트를 즐길 수 있습니다.",
      rating: 4.6,
      tags: ["도시", "문화", "음식", "쇼핑"],
      whyRecommended: "가까운 해외여행지로 짧은 기간에도 풍부한 경험이 가능하며, 가족 친화적인 테마파크와 다양한 먹거리가 있습니다.",
      bestTimeToVisit: "3월-5월, 10월-11월",
      estimatedBudget: "1,200,000원",
      imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000", // 도쿄 이미지
    },
  ]
};

export async function getDestinationRecommendations(
  startDate: string,
  endDate: string,
  travelType: string,
  interests: string,
) {
  try {
    const prompt = `
-- Response Format --
Provide only the raw JSON object. The response must start with '{' and end with '}', with no extra text or markdown.

You are a professional travel consultant. Please recommend 4-5 travel destinations that match the user's travel conditions in JSON format.

-- Output Requirements --
- Top-level key: "destinations" (array)
- No markdown fences, no comments, no surrounding text

Travel conditions:
- Travel period: ${startDate} to ${endDate}
- Travel type: ${travelType}
- Interests/Activities: ${interests}

Important guidelines:
1. Please provide your response according to the JSON schema in a concise manner.
2. Select destinations that best suit the user's conditions (season, interests, travel type).
3. Write descriptions briefly and clearly in a single paragraph in Korean.
4. Make sure all text fields are properly enclosed in quotation marks and strings are properly terminated.
5. Keep the recommendation reasons concise and never exceed 150 characters.
6. Write IDs as short English words (e.g., 'jeju', 'tokyo').
7. Include only 3-4 short words for tags.
8. Avoid repetitive words or excessive exclamations in recommendation reasons; keep them natural and concise.

IMPORTANT: Each destination MUST include ALL of the following fields:
{
  "id": "string",
  "city": "string",
  "country": "string",
  "summary": "string",
  "description": "string",
  "rating": number,
  "tags": ["string", "string", "string"],
  "whyRecommended": "string",
  "bestTimeToVisit": "string",
  "estimatedBudget": "string",
  "imageUrl": "string"
}

Include the following information for each destination:
- City and country names (each under 40 characters) in Korean
- One-line summary (under 60 characters) in Korean
- Detailed description (under 200 characters) in Korean
- Rating (a number between 1-5, with one decimal place)
- 3-4 related tags (each under 10 characters) in Korean
- Reason for recommendation (strictly under 150 characters) in Korean
- Best time to visit (under 30 characters) in Korean
- Estimated budget (per person, in Korean won, under 30 characters) in Korean
- Image URL (a placeholder URL will be replaced with actual image)

All responses must be in Korean.
Make sure all fields are included and the JSON format is accurate. Pay special attention to string termination.
Include destinations from various regions and budget ranges.
`

    // AI 응답 로직
    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      temperature: 0.3,
      maxTokens: 1500,
      frequencyPenalty: 0.5,
      presencePenalty: 0.0,
    })
    // JSON 추출
    const raw = text.trim()
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    const jsonText = start >= 0 && end >= 0 ? raw.slice(start, end + 1) : raw
    // 파싱 및 destinations 배열 감지
    const parsedRaw: any = JSON.parse(jsonText)
    let parsedObj: any
    if (parsedRaw.destinations && Array.isArray(parsedRaw.destinations)) {
      parsedObj = parsedRaw
    } else if (Array.isArray(parsedRaw)) {
      parsedObj = { destinations: parsedRaw }
    } else {
      // 객체 내 첫 배열 값 탐색
      const arr = Object.values(parsedRaw).find(v => Array.isArray(v))
      if (arr) parsedObj = { destinations: arr }
      else throw new Error("No destinations array in AI response")
    }

    // 각 목적지에 기본 이미지 URL 추가
    const destinationImages = {
      "제주도": "https://images.unsplash.com/photo-1546632891-c0905cfc4a8b?q=80&w=1000",
      "도쿄": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000",
      "오사카": "https://images.unsplash.com/photo-1590559899731-a382839e5549?q=80&w=1000",
      "서울": "https://images.unsplash.com/photo-1538669715315-155098f0fb1d?q=80&w=1000",
      "부산": "https://images.unsplash.com/photo-1542640244-7e672d6cef4e?q=80&w=1000",
      "방콕": "https://images.unsplash.com/photo-1563492065599-3520f775eeed?q=80&w=1000",
      "싱가포르": "https://images.unsplash.com/photo-1565967511849-76a60a516170?q=80&w=1000",
      "홍콩": "https://images.unsplash.com/photo-1576788369575-4ab045b9287e?q=80&w=1000",
      "타이페이": "https://images.unsplash.com/photo-1598935898639-81586f7d2129?q=80&w=1000",
      "마카오": "https://images.unsplash.com/photo-1555588746-13edde80e4a1?q=80&w=1000",
      "베이징": "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1000",
      "상하이": "https://images.unsplash.com/photo-1545893835-abaa50cbe628?q=80&w=1000",
      "하노이": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000",
      "다낭": "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=1000",
      "호치민": "https://images.unsplash.com/photo-1583417319070-4a69db38a482?q=80&w=1000",
      "발리": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000",
      "세부": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000",
      "보라카이": "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?q=80&w=1000",
      "괌": "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000",
      "사이판": "https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?q=80&w=1000",
      "파리": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000",
      "런던": "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000",
      "로마": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1000",
      "바르셀로나": "https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=1000",
      "마드리드": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000",
      "베니스": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?q=80&w=1000",
      "프라하": "https://images.unsplash.com/photo-1519677100203-a0e668c92439?q=80&w=1000",
      "비엔나": "https://images.unsplash.com/photo-1516550893923-42d28e5677af?q=80&w=1000",
      "취리히": "https://images.unsplash.com/photo-1515488764276-beab7607c1e6?q=80&w=1000",
      "뉴욕": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=1000",
      "샌프란시스코": "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=1000",
      "하와이": "https://images.unsplash.com/photo-1542259009477-d625272157b7?q=80&w=1000"
    };

    // 각 목적지에 이미지 URL 추가
    parsedObj.destinations = parsedObj.destinations.map((dest: any) => ({
      ...dest,
      imageUrl: destinationImages[dest.city] || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=1000" // 기본 여행 이미지
    }));

    return destinationSchema.parse(parsedObj)
  } catch (error) {
    console.error("Error generating destination recommendations:", error)
    // 에러를 상위로 전달하여 mock 데이터 저장 방지
    throw error
  }
}

export async function generateItinerary(
  destination: string,
  country: string,
  startDate: string,
  endDate: string,
  travelType: string,
  interests: string,
) {
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const prompt = `
당신은 전문 여행 계획가입니다. ${destination}, ${country}에서 ${totalDays}일간의 여행 일정을 JSON 형식으로 만들어주세요.

여행 조건:
- 여행지: ${destination}, ${country}
- 여행 기간: ${startDate}부터 ${endDate}까지 (총 ${totalDays}일)
- 여행 유형: ${travelType}
- 관심사/활동: ${interests}

중요: 응답은 다음 JSON 형식만 작성하고, 마크다운이나 추가 텍스트 없이 JSON만 반환하세요.

{
  "destination": "${destination}",
  "country": "${country}",
  "totalDays": ${totalDays},
  "travelType": "${travelType}",
  "overview": "여행 개요를 150-200자 이내로 작성해주세요",
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "title": "1일차: 주제",
      "activities": [
        {
          "time": "09:00",
          "title": "활동 제목",
          "description": "활동 설명",
          "location": "장소",
          "estimatedCost": "예상 비용",
          "tips": "유용한 팁"
        },
        {
          "time": "12:00",
          "title": "점심 식사",
          "description": "식당 설명",
          "location": "식당 위치",
          "estimatedCost": "예상 비용",
          "tips": "추천 메뉴"
        }
      ]
    }
  ]
}

지침:
1. 모든 내용은 한국어로 작성하세요.
2. 하루에 4-6개의 활동을 현실적으로 계획하세요.
3. 이동 시간과 휴식 시간을 고려하세요.
4. 식사 시간과 위치를 포함하세요.
5. 현지 문화와 독특한 경험을 포함하세요.
6. JSON 형식을 엄격히 준수하세요.
`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.3, // 더 낮은 온도로 일관성 높이기
      maxTokens: 10000,  // 토큰 수 증가
    })

    // AI 응답에서 JSON 객체만 추출
    const rawItin = text.trim()
    const sItin = rawItin.indexOf('{')
    const eItin = rawItin.lastIndexOf('}')
    const jsonTextItin = sItin >= 0 && eItin >= 0 ? rawItin.slice(sItin, eItin + 1) : rawItin

    // JSON 파싱 시도
    try {
      const data = JSON.parse(jsonTextItin)
      return itinerarySchema.parse(data)
    } catch (jsonError) {
      console.error("JSON 파싱 오류:", jsonError)
      console.log("받은 JSON 문자열:", jsonTextItin.substring(0, 500) + "...")
      throw new Error("여행 계획 생성 중 JSON 형식 오류가 발생했습니다.")
    }
  } catch (error) {
    console.error("Error generating itinerary:", error)
    throw new Error("여행 계획을 생성하는 중 오류가 발생했습니다.")
  }
}

export async function updateItineraryWithFeedback(currentItinerary: any, feedback: string) {
  try {
    const prompt = `
You are a professional travel planner. Please modify the travel plan to reflect the user's feedback.

Current travel plan:
${JSON.stringify(currentItinerary, null, 2)}

User feedback:
${feedback}

Important guidelines:
1. Maintain the existing JSON structure and adhere to the schema for all responses.
2. Carefully incorporate the user's feedback to adjust the itinerary.
3. Make realistic changes to the sections based on the user's requests.
4. Apply time adjustments, add/remove activities, change order, etc. as needed.
5. Ensure all strings are properly closed.
6. Maintain the overall flow and consistency of the trip.
7. Provide all responses in Korean language.

Consider the following when modifying the schedule:
- Whether travel times are realistic
- Whether the daily schedule is not too demanding
- Whether activities of interest to the user are sufficiently included
- Whether meal and rest times are appropriately distributed

Maintain the basic structure and format of the existing plan while providing an improved travel plan that incorporates the feedback.
`

    const { text } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt,
      temperature: 0.5, // 피드백 반영의 정확성을 위해 온도 더 낮춤
      maxTokens: 10000,  // 상세 여행 계획을 위해 토큰 수 유지
    })
    // AI 응답에서 JSON 객체만 추출
    const rawUpd = text.trim()
    const sUpd = rawUpd.indexOf('{')
    const eUpd = rawUpd.lastIndexOf('}')
    const jsonTextUpd = sUpd >= 0 && eUpd >= 0 ? rawUpd.slice(sUpd, eUpd + 1) : rawUpd
    const data = JSON.parse(jsonTextUpd)
    return itinerarySchema.parse(data)
  } catch (error) {
    console.error("Error updating itinerary:", error)
    throw new Error("여행 계획 수정 중 오류가 발생했습니다.")
  }
}
