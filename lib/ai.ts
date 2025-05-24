import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
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
    },
    {
      id: "2",
      city: "도쿄",
      country: "일본",
      summary: "전통과 현대가 공존하는 매력적인 대도시",
      description: "일본의 수도 도쿄는 첨단 기술과 전통 문화가 조화를 이루는 독특한 도시입니���. 다양한 쇼핑, 음식, ��터테인먼트를 즐길 수 있습니다.",
      rating: 4.6,
      tags: ["도시", "문화", "음식", "쇼핑"],
      whyRecommended: "가까운 해외여행지로 짧은 기간에도 풍부한 경험이 가능하며, 가족 친화적인 테마파크와 다양한 먹거리가 있습니다.",
      bestTimeToVisit: "3월-5월, 10월-11월",
      estimatedBudget: "1,200,000원",
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
사용자의 여행 조건에 맞는 여행지 4-6개를 추천해주세요.

여행 조건:
- 여행 기간: ${startDate}부터 ${endDate}까지
- 여행 유형: ${travelType}
- 관심사/하고 싶은 것: ${interests}

각 여행지에 대해 다음 정보를 포함해주세요:
- 도시명과 국가
- 한 줄 요약 (20단어 이내)
- 상세 설명 (2-3문장, 총 100단어 이내)
- 평점 (1-5점)
- 관련 태그 3-4개 (짧은 단어로)
- 추천 이유 (50-100단어 이내, 반복 없이 간결하게)
- 최적 방문 시기 (간결하게)
- 예상 예산 (1인 기준, 한국 원화)

다양한 지역과 예산대의 여행지를 포함해주세요.
응답이 너무 길어지�� 않도록 각 항목을 간결하게 작성해주세요.
반복되는 내용이나 불필요한 문구는 포함하지 마세요.
`

    try {
      const result = await generateObject({
        model: google("gemini-2.0-flash-exp"),
        prompt,
        schema: destinationSchema,
        temperature: 0.7, // 다양성과 정확성의 균형
        maxTokens: 2000,  // 토큰 길이 제한
      })

      return result.object
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)

      // 백업 방식으로 다시 시도
      try {
        const retryResult = await generateObject({
          model: google("gemini-1.5-pro-latest"),  // 다른 모델로 시도
          prompt,
          schema: destinationSchema,
          temperature: 0.5,  // 더 낮은 온도로 더 일관된 응답 유도
          maxTokens: 1500,   // 더 짧게 제한
        })

        return retryResult.object
      } catch (retryError) {
        console.error("Retry failed:", retryError)
        // 모든 시도가 실패하면 기본 데이터 반환
        return fallbackDestinations;
      }
    }
  } catch (error) {
    console.error("Error generating destination recommendations:", error)
    // 어떤 오류가 발생하더라도 기본 데이터 반환
    return fallbackDestinations;
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
${destination}, ${country}에 대한 ${totalDays}일 여행 계획을 세워주세요.

여행 조건:
- 목적지: ${destination}, ${country}
- 여행 기간: ${startDate}부터 ${endDate}까지 (${totalDays}일)
- 여행 유형: ${travelType}
- 관심사/하고 싶은 것: ${interests}

다음 사항을 고려해서 계획해주세요:
- ${travelType} 여행에 적합한 활동과 장소
- 현실적인 시간 배분과 이동 경로
- 각 활동의 예상 소요 시간
- 식사 시간과 휴식 시간 포함
- 현지 교통편과 이동 시간 고려
- 예상 비용과 팁 제공

각 일정에 대해:
- 시간별 상세 일정
- 활동 설명
- 위치 정보
- 예상 비용 (선택사항)
- 여행 팁 (선택사항)

전체 여행에 대한 개요도 포함해주세요.
`

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      schema: itinerarySchema,
    })

    return result.object
  } catch (error) {
    console.error("Error generating itinerary:", error)
    throw new Error("여행 계획을 생성하는 중 오류가 발생했습니다.")
  }
}

export async function updateItineraryWithFeedback(currentItinerary: any, feedback: string) {
  try {
    const prompt = `
다음은 현재 여행 계획입니다:
${JSON.stringify(currentItinerary, null, 2)}

사용자 피드백:
${feedback}

피드백을 반영하여 여행 계획을 수정해주세요. 기존 계획의 구조는 유지하되, 사용자의 요청사항을 반영해서 개선해주세요.
`

    const result = await generateObject({
      model: google("gemini-2.0-flash-exp"),
      prompt,
      schema: itinerarySchema,
    })

    return result.object
  } catch (error) {
    console.error("Error updating itinerary:", error)
    throw new Error("여행 계획 수정 중 오류가 발생했습니다.")
  }
}
