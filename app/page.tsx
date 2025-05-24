"use client"

import type React from "react"

import Image from "next/image"
import { Search, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePickerWithRange } from "@/components/date-range-picker"
import { TravelTypeSelector } from "@/components/travel-type-selector"
import { PopularDestinations } from "@/components/popular-destinations"
import { searchDestinations } from "@/app/actions/travel"
import { useState, useTransition, useEffect } from "react"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [isPending, startTransition] = useTransition()
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    travelType: "",
    interests: "",
  })

  // 초기 날짜 설정
  useEffect(() => {
    const today = new Date()
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
    setFormData((prev) => ({
      ...prev,
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(nextWeek, "yyyy-MM-dd"),
    }))
  }, [])
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.startDate || !formData.endDate || !formData.travelType || !formData.interests) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const form = new FormData()
        form.append("startDate", formData.startDate)
        form.append("endDate", formData.endDate)
        form.append("travelType", formData.travelType)
        form.append("interests", formData.interests)

        await searchDestinations(form)
      } catch (error) {
        toast({
          title: "오류 발생",
          description: "여행지 검색 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-50 to-sky-100"></div>
      <div className="absolute right-0 top-20 md:top-40 -z-10 opacity-10 rotate-12 transform scale-75 md:scale-100">
        <Image src="/images/airplane.png" alt="비행기 이미지" width={400} height={300} className="object-contain" />
      </div>
      <div className="absolute left-0 bottom-20 -z-10 opacity-10 -rotate-12 transform scale-75 md:scale-100">
        <Image src="/images/airplane.png" alt="비행기 이미지" width={300} height={225} className="object-contain" />
      </div>

      {/* Logo and Title */}
      <div className="mt-20 md:mt-32 text-center">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-sky-600 to-cyan-400 bg-clip-text text-transparent">
          트립지니와 함께 떠나볼까요?
        </h1>
      </div>

      {/* Main Search Form */}
      <div className="w-full max-w-3xl mt-10 px-4">
        <form onSubmit={handleSubmit}>
          <div className="backdrop-blur-md bg-white/70 rounded-2xl shadow-lg p-6 border border-white/50">
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">여행 일정</label>
                  <DatePickerWithRange
                    onDateChange={(startDate, endDate) => {
                      setFormData((prev) => ({
                        ...prev,
                        startDate: startDate || "",
                        endDate: endDate || "",
                      }))
                    }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">여행 유형</label>
                  <TravelTypeSelector
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, travelType: value }))
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">하고 싶은 것들</label>
                <div className="relative">
                  <Input
                    placeholder="예: 맛집 탐방, 미술관 관람, 해변에서 휴식..."
                    className="pl-10 bg-white/80 border-slate-200"
                    value={formData.interests}
                    onChange={(e) => setFormData((prev) => ({ ...prev, interests: e.target.value }))}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full py-6 text-lg bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AI가 여행지를 찾고 있어요...
                  </>
                ) : (
                  "여행을 떠나봐요"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Popular Destinations */}
      <div className="w-full max-w-4xl mt-16 px-4 mb-20">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-sky-500" />
          <h2 className="text-xl font-semibold text-slate-800">실시간 인기 여행지</h2>
        </div>
        <div className="backdrop-blur-md bg-white/50 rounded-xl p-6 border border-white/30">
          <PopularDestinations />
        </div>
      </div>
    </main>
  )
}
