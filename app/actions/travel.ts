"use server"

import { getDestinationRecommendations, generateItinerary, updateItineraryWithFeedback } from "@/lib/ai"
import { redirect } from "next/navigation"

export async function searchDestinations(formData: FormData) {
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const travelType = formData.get("travelType") as string
  const interests = formData.get("interests") as string

  if (!startDate || !endDate || !travelType || !interests) {
    throw new Error("모든 필드를 입력해주세요.")
  }

  try {
    const recommendations = await getDestinationRecommendations(startDate, endDate, travelType, interests)

    // URL에 검색 조건과 결과를 인코딩하여 전달
    const searchParams = new URLSearchParams({
      startDate,
      endDate,
      travelType,
      interests,
      results: JSON.stringify(recommendations),
    })

    redirect(`/destinations?${searchParams.toString()}`)
  } catch (error) {
    console.error("Error in searchDestinations:", error)
    throw error
  }
}

export async function createItinerary(
  destination: string,
  country: string,
  startDate: string,
  endDate: string,
  travelType: string,
  interests: string,
) {
  try {
    const itinerary = await generateItinerary(destination, country, startDate, endDate, travelType, interests)

    // URL에 여행 계획을 인코딩하여 전달
    const searchParams = new URLSearchParams({
      destination,
      country,
      startDate,
      endDate,
      travelType,
      interests,
      itinerary: JSON.stringify(itinerary),
    })

    redirect(`/plan/${encodeURIComponent(destination)}?${searchParams.toString()}`)
  } catch (error) {
    console.error("Error in createItinerary:", error)
    throw error
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
