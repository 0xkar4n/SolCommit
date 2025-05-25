"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Activity, TrendingUp } from "lucide-react"
import TransactionHeatmap from "@/components/TransactionHeatmap"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface Transaction {
  address: string
  block_time: number
  chain: string
  block_slot: number
  raw_transaction: object
}

interface ApiResponse {
  next_offset: string
  transactions: Transaction[]
}

export default function SolanaHeatmapPage() {
  const [address, setAddress] = useState("")
  const [submittedAddress, setSubmittedAddress] = useState("")
  const [error, setError] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const queryClient = useQueryClient()

  const isRefetchTriggered = useRef(false)

  const {
    data,
    error: queryError,
    isFetching,
    isRefetching,
    isLoading,
    isStale,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ["transactions", submittedAddress],
    queryFn: async () => {
      if (!submittedAddress) throw new Error("No address provided")
      isRefetchTriggered.current = true
      
      const response = await fetch(`/api/get-transactions?address=${encodeURIComponent(submittedAddress)}`)
      if (!response.ok) throw new Error("Failed to fetch transactions")
      const result = await response.json()
      
      isRefetchTriggered.current = false
      return result
    },
    enabled: !!submittedAddress,
    staleTime: 60 * 1000, 
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  })

  const showLoading = isAnalyzing || (isLoading && !data) || (isFetching && isRefetchTriggered.current)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const addr = address.trim()
    if (!addr) {
      setError("Please enter a valid Solana address")
      return
    }

    setIsAnalyzing(true)

    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1000))

    try {
      setSubmittedAddress(addr)

      const cacheKey = ["transactions", addr]
      const cachedData = queryClient.getQueryData<ApiResponse>(cacheKey)
      const queryState = queryClient.getQueryState(cacheKey)

      let dataPromise: Promise<any>


      
      if (!cachedData || queryState?.isStale) {
        isRefetchTriggered.current = true
        dataPromise = refetch()
      } else {
        dataPromise = Promise.resolve(cachedData)
      }

      await Promise.all([minLoadingTime, dataPromise])
      
    } catch (error) {
      console.error("Error fetching transactions:", error)
      await minLoadingTime
    } finally {
      setIsAnalyzing(false)
      isRefetchTriggered.current = false
    }
  }

  const transactions = data?.transactions ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-100 dark:from-black/60 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center space-y-4 mb-8">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Solana Transaction Heatmap
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            Visualize Solana transaction activity over time with an interactive heatmap. Track daily transaction
            patterns and discover activity trends similar to GitHub's contribution graph.
          </p>
        </div>

        <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-white/10 backdrop-blur-sm mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="h-5 w-5 text-purple-600" />
              Analyze Solana Address
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter a Solana wallet address to view its transaction history and activity patterns
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="text"
                  placeholder="e.g., 5gzvCP1crENrDnQaEboX9fpD7TQ4URnYrAUKxWH8ghFY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="flex-1 h-12 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white focus:border-purple-500 focus:ring-purple-500"
                  disabled={showLoading}
                />
                <Button
                  type="submit"
                  disabled={showLoading || !address.trim()}
                  className="h-12 px-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {showLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Analyze
                    </div>
                  )}
                </Button>
              </div>
              {(error || queryError) && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium">
                    {error || (queryError as Error)?.message}
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {transactions.length > 0 && (
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-white/10 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-xl">Transaction Activity Heatmap</CardTitle>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  {transactions.length} transactions found
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Address: <span className="font-mono text-purple-600 dark:text-purple-400">{submittedAddress}</span>
              </p>
            </CardHeader>
            <CardContent className="pt-0">
              <TransactionHeatmap transactions={transactions} />
            </CardContent>
          </Card>
        )}

        {transactions.length === 0 && !showLoading && submittedAddress && !error && !queryError && (
          <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-white/10 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Transactions Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                No transaction history was found for this address. The address might be new or inactive.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}