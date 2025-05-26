import { Sparkles } from "lucide-react"

interface AILoadingPopupProps {
  message?: string
}

export function AILoadingPopup({ message = "AI가 여행 계획을 생성하고 있어요..." }: AILoadingPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-white/20 animate-in zoom-in-50 duration-200">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500/20 to-cyan-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-t-sky-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="space-y-2">
            <p className="text-slate-800 font-medium text-lg">{message}</p>
            <p className="text-sm text-slate-500">잠시만 기다려주세요...</p>
          </div>
          <div className="w-full max-w-[200px] h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 w-1/2 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  )
} 