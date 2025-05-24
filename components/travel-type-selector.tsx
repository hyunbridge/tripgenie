"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Users, Heart, UserRound, Users2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

const travelTypes = [
  {
    value: "family",
    label: "가족",
    icon: <Users2 className="mr-2 h-4 w-4" />,
  },
  {
    value: "couple",
    label: "연인",
    icon: <Heart className="mr-2 h-4 w-4" />,
  },
  {
    value: "friends",
    label: "친구",
    icon: <Users className="mr-2 h-4 w-4" />,
  },
  {
    value: "solo",
    label: "혼자",
    icon: <UserRound className="mr-2 h-4 w-4" />,
  },
]

interface TravelTypeSelectorProps {
  onValueChange?: (value: string) => void
}

export function TravelTypeSelector({ onValueChange }: TravelTypeSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === value ? "" : currentValue
    setValue(newValue)
    setOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-white/80 border-slate-200"
        >
          {value ? (
            <>
              {travelTypes.find((type) => type.value === value)?.icon}
              {travelTypes.find((type) => type.value === value)?.label}
            </>
          ) : (
            <span className="text-muted-foreground flex items-center">
              <Users className="mr-2 h-4 w-4" />
              여행 유형 선택
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="여행 유형 검색..." />
          <CommandList>
            <CommandEmpty>여행 유형을 찾을 수 없습니다.</CommandEmpty>
            <CommandGroup>
              {travelTypes.map((type) => (
                <CommandItem key={type.value} value={type.value} onSelect={handleSelect}>
                  <Check className={cn("mr-2 h-4 w-4", value === type.value ? "opacity-100" : "opacity-0")} />
                  {type.icon}
                  {type.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
