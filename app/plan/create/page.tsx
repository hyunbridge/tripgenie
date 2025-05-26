"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createItinerary, findExistingPlan } from "@/app/actions/travel"
import { useToast } from "@/hooks/use-toast"
import TravelPlanLoading from "../[id]/loading"

export default function CreatePlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function createPlan() {
      try {
        const destination = searchParams.get("destination") || ""
        const country = searchParams.get("country") || ""
        const startDate = searchParams.get("startDate") || ""
        const endDate = searchParams.get("endDate") || ""
        const travelType = searchParams.get("travelType") || ""
        const interests = searchParams.get("interests") || ""
        const imageUrl = searchParams.get("imageUrl") || ""
        const searchId = searchParams.get("searchId") || undefined

        if (!destination || !country || !startDate || !endDate || !travelType) {
          setError("필수 정보가 누락되었습니다.")
          return
        }

        // 기존 계획 검색
        const existingPlanId = await findExistingPlan(
          destination,
          country,
          startDate,
          endDate,
          travelType,
          interests,
          searchId
        )

        if (existingPlanId) {
          console.log('Found existing plan, redirecting to:', existingPlanId)
          router.push(`/plan/${existingPlanId}`)
          return
        }

        // 기존 계획이 없는 경우 새로 생성
        const result = await createItinerary(
          destination,
          country,
          startDate,
          endDate,
          travelType,
          interests,
          imageUrl,
          searchId
        )

        if (result.success && result.planId) {
          router.push(`/plan/${result.planId}`)
        } else {
          throw new Error(result.error || "여행 계획 생성에 실패했습니다.")
        }
      } catch (error) {
        console.error("Error in createPlan:", error)
        setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      }
    }

    createPlan()
  }, [router, searchParams, toast])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-sky-600 hover:text-sky-800"
            >
              이전 페이지로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <TravelPlanLoading creating={true} />
}
