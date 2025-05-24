"use client"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"

// 인기 여행지 데이터 (실제로는 API에서 가져올 것)
const popularDestinations = [
  {
    id: 1,
    city: "제주도",
    country: "대한민국",
    summary: "아름다운 자연과 독특한 문화가 어우러진 섬",
    image: "/placeholder.svg?height=150&width=250",
    tags: ["자연", "휴양", "맛집"],
  },
  {
    id: 2,
    city: "교토",
    country: "일본",
    summary: "전통과 현대가 공존하는 일본의 고도",
    image: "/placeholder.svg?height=150&width=250",
    tags: ["역사", "문화", "사찰"],
  },
  {
    id: 3,
    city: "다낭",
    country: "베트남",
    summary: "해변과 산이 만나는 매력적인 도시",
    image: "/placeholder.svg?height=150&width=250",
    tags: ["해변", "리조트", "가성비"],
  },
  {
    id: 4,
    city: "파리",
    country: "프랑스",
    summary: "예술과 로맨스의 도시",
    image: "/placeholder.svg?height=150&width=250",
    tags: ["예술", "미식", "랜드마크"],
  },
]

export function PopularDestinations() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {popularDestinations.map((destination) => (
        <Card
          key={destination.id}
          className="overflow-hidden group hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/50 cursor-pointer"
          onClick={() => (window.location.href = "/destinations")}
        >
          <div className="relative h-40">
            <Image
              src={destination.image || "/placeholder.svg"}
              alt={destination.city}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="flex items-center text-white">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">
                  {destination.city}, {destination.country}
                </span>
              </div>
            </div>
          </div>
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-2">{destination.summary}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {destination.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-sky-100 text-sky-700 hover:bg-sky-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
