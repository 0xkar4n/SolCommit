"use client"

import { useMemo, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


interface Transaction {
  address: string
  block_time: number
  chain: string
  block_slot: number
  raw_transaction?: {
    meta?: {
      fee?: number;
    };}
}

interface HeatmapProps {
  transactions: Transaction[]
}

interface DayData {
  date: Date
  count: number
  transactions: Transaction[]
  dayOfWeek: number
  weekIndex: number
}

 interface MonthLabel {
  month: string;
  weekIndex: number;
}


export default function TransactionHeatmap({ transactions }: HeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null)

  const heatmapData = useMemo(() => {
    const transactionsByDate = new Map<string, Transaction[]>()

    transactions.forEach((tx) => {
      const date = new Date(tx.block_time / 1000)
      const dateKey = date.toISOString().split("T")[0]
      if (!transactionsByDate.has(dateKey)) {
        transactionsByDate.set(dateKey, [])
      }
      transactionsByDate.get(dateKey)!.push(tx)
    })

    const today = new Date()
    const currentDayOfWeek = today.getDay()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 52 * 7 - currentDayOfWeek)

    const days: DayData[] = []
    const totalDays = 53 * 7

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateKey = date.toISOString().split("T")[0]
      const dayTransactions = transactionsByDate.get(dateKey) || []
      const dayOfWeek = date.getDay()
      const weekIndex = Math.floor(i / 7)

      days.push({
        date,
        count: dayTransactions.length,
        transactions: dayTransactions,
        dayOfWeek,
        weekIndex,
      })
    }

    return days
  }, [transactions])

  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1)

  const totalFeesLamports = transactions.reduce((sum, tx) => {
  // guard against missing meta
  const fee = tx.raw_transaction?.meta?.fee ?? 0;
  return sum + fee;
}, 0);
const totalFeesSOL = (totalFeesLamports / 1e9).toFixed(4);

// 2. Compute today’s fees in SOL:
const todayKey = new Date().toISOString().split("T")[0];
const todayFeesLamports = transactions
  .filter((tx) => {
    const dateKey = new Date(tx.block_time / 1000)
      .toISOString()
      .split("T")[0];
    return dateKey === todayKey;
  })
  .reduce((sum, tx) => sum + (tx.raw_transaction?.meta?.fee ?? 0), 0);
const todayFeesSOL = (todayFeesLamports / 1e9).toFixed(4);

const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

const totalYearTransactions = transactions.filter((tx) => {
  const txDate = new Date(tx.block_time / 1000);
  return txDate >= oneYearAgo;
}).length;


  const getIntensity = (count: number) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count <= 3) return 2
    if (count <= 6) return 3
    return 4
  }

  const getColorClass = (intensity: number) => {
    const base = [
      "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700",
      "bg-emerald-200 dark:bg-emerald-200 hover:bg-emerald-300 dark:hover:bg-emerald-300 border-emerald-300 dark:border-emerald-600",
      "bg-emerald-400 dark:bg-emerald-400 hover:bg-emerald-500 dark:hover:bg-emerald-500 border-emerald-500 dark:border-emerald-500",
      "bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 border-emerald-700 dark:border-emerald-700",
      "bg-emerald-800 dark:bg-emerald-800 hover:bg-emerald-900 dark:hover:bg-emerald-900 border-emerald-900 dark:border-emerald-900",
    ]
    return base[intensity] || base[0]
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formatTime = (blockTime: number) =>
    new Date(blockTime / 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })

  const weeks:DayData[][] = []
  for (let weekIndex = 0; weekIndex < 53; weekIndex++) {
    const weekDays = heatmapData.filter((day) => day.weekIndex === weekIndex)
    weeks.push(weekDays)
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const monthLabels: MonthLabel[] = []
  let currentMonth = -1
  weeks.forEach((week, weekIndex) => {
    if (week.length > 0) {
      const firstDay = week[0]
      const month = firstDay.date.getMonth()
      if (month !== currentMonth && firstDay.date.getDate() <= 7) {
        monthLabels.push({
          month: months[month],
          weekIndex,
        })
        currentMonth = month
      }
    }
  })

  return (
    <TooltipProvider>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row py-2 items-start sm:items-center justify-between text-sm text-gray-600 dark:text-gray-400 gap-2">
          <span className="font-medium">
            {heatmapData.filter((d) => d.count > 0).length} days with transactions in the last year
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((intensity) => {
                const colors = getColorClass(intensity).split(" ")
                return (
                  <div
                    key={intensity}
                    className={`w-3 h-3 rounded-sm border ${colors.join(" ")}`}
                  />
                )
              })}
            </div>
            <span className="text-xs">More</span>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900 overflow-x-auto">
          <div className="min-w-[768px]">
            <div className="flex mb-6 ">
              <div className="w-8 flex-shrink-0"></div>
              <div className="w-full relative">
                {monthLabels.map((label, index) => (
                  <div
                    key={index}
                    className="absolute text-xs text-gray-500 dark:text-gray-400 font-medium"
                    style={{
                      left: `${(label.weekIndex / weeks.length) * 100}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    {label.month}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex">
              <div className="w-8 flex-shrink-0 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400 pr-2">
                {weekdays.map((day, index) => (
                  <div key={day} className="h-3 flex items-center justify-end">
                    {index % 2 === 1 && <span className="font-medium">{day}</span>}
                  </div>
                ))}
              </div>

              <div className="flex-1">
                <div
                  className="grid grid-rows-7 gap-1"
                  style={{
                    gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: 7 }, (_, dayOfWeek) =>
                    weeks.map((week, weekIndex) => {
                      const dayData = week.find((d) => d.dayOfWeek === dayOfWeek)
                      if (!dayData) {
                        return (
                          <div
                            key={`${weekIndex}-${dayOfWeek}`}
                            className="w-3 h-3"
                            style={{ gridRow: dayOfWeek + 1, gridColumn: weekIndex + 1 }}
                          />
                        )
                      }

                      return (
                        <Tooltip key={`${weekIndex}-${dayOfWeek}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-[12px] h-[12px] rounded-sm border cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-400 dark:hover:ring-blue-500 hover:ring-opacity-50 ${getColorClass(
                                getIntensity(dayData.count)
                              )}`}
                              style={{ gridRow: dayOfWeek + 1, gridColumn: weekIndex + 1 }}
                              onMouseEnter={() => setHoveredDay(dayData)}
                              onMouseLeave={() => setHoveredDay(null)}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm text-neutral-200 dark:text-neutral-500">
                                {formatDate(dayData.date)}
                              </div>
                              <div className="text-sm">
                                {dayData.count === 0 ? (
                                  <span className="text-gray-500">No transactions</span>
                                ) : (
                                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                    {dayData.count} transaction{dayData.count === 1 ? "" : "s"}
                                  </span>
                                )}
                              </div>
                              {dayData.transactions.length > 0 && (
                                <div className="text-xs space-y-1 max-h-32 overflow-y-auto border-t pt-2 border-neutral-600 dark:border-neutral-400 ">
                                  <div className="font-medium text-neutral-200 dark:text-neutral-500">Recent transactions:</div>
                                  {dayData.transactions.slice(0, 3).map((tx, txIndex) => (
                                    <div key={txIndex} className="flex justify-between text-neutral-400 dark:text-neutral-500">
                                      <span>Block {tx.block_slot.toLocaleString()} &nbsp;</span>
                                      <span className="text-neutral-400 dark:text-neutral-500">{formatTime(tx.block_time)}</span>
                                    </div>
                                  ))}
                                  {dayData.transactions.length > 3 && (
                                    <div className="text-gray-500 text-center pt-1">
                                      +{dayData.transactions.length - 3} more transactions
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })
                  ).flat()}
                </div>
              </div>
            </div>
          </div>
        </div>

       
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
  {[
    {
      label: "Total Transactions",
      value: transactions.length.toLocaleString(),
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      label: "Total Transactions (1yr)",
      value: totalYearTransactions.toLocaleString(),
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      label: "Active Days",
      value: heatmapData.filter((d) => d.count > 0).length,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Busiest Day",
      value: Math.max(...heatmapData.map((d) => d.count)),
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Daily Average",
      value:
        transactions.length > 0
          ? (transactions.length / 365).toFixed(1)
          : "0.0",
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      label: "Total Fees (SOL)",
      value: `${totalFeesSOL}`,
      color: "text-pink-600 dark:text-pink-400",
    },
     
  ].map((stat, i) => (
    <div
    key={i}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-center"
    >
      <div className={`text-2xl font-bold ${stat.color}`}>
        {stat.value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
        {stat.label}
      </div>
    </div>
  ))}
</div>


      </div>
    </TooltipProvider>
  )
}
