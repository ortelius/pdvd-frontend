'use client'

import React, { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ReferenceLine
} from 'recharts'

import { graphqlQuery, GET_DASHBOARD_VULNERABILITY_TREND } from '@/lib/graphql'
import { GetVulnerabilityTrendResponse, VulnerabilityTrend } from '@/lib/types'

// --- Material UI Icons ---
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import ScheduleIcon from '@mui/icons-material/Schedule'

// --- Color Palette ---
// Updated to match page.tsx vulnerability table icons
const COLORS = {
  low: 'rgb(79, 121, 255)',      // Blue (was #9ca3af)
  medium: 'rgb(255, 206, 84)',   // Yellow/Gold (was #3b82f6)
  high: 'rgb(255, 144, 79)',     // Orange (was #FFCC00)
  critical: 'rgb(185, 28, 28)'  // Red (was #CC0000)
}

// Mock Data for mini sparklines and MTTR
const lineData = [
  { name: 'Jan 1', days: 15 },
  { name: 'Jan 15', days: 12 },
  { name: 'Feb 1', days: 17 },
  { name: 'Feb 15', days: 13 },
  { name: 'Mar 1', days: 22 },
  { name: 'Mar 15', days: 15 },
  { name: 'Apr 1', days: 12 },
  { name: 'Apr 15', days: 16 },
  { name: 'May 1', days: 13 },
]

// Mock Data for "Endpoint remediation health"
const barData = [
  { name: 'Jan 1', Healthy: 20, Risk: 5 },
  { name: 'Jan 8', Healthy: 22, Risk: 8 },
  { name: 'Jan 15', Healthy: 25, Risk: 6 },
  { name: 'Jan 22', Healthy: 24, Risk: 9 },
  { name: 'Jan 29', Healthy: 26, Risk: 7 },
  { name: 'Feb 5', Healthy: 28, Risk: 10 },
  { name: 'Feb 12', Healthy: 27, Risk: 8 },
  { name: 'Feb 19', Healthy: 30, Risk: 11 },
  { name: 'Feb 26', Healthy: 32, Risk: 9 },
  { name: 'Mar 5', Healthy: 35, Risk: 12 },
  { name: 'Mar 12', Healthy: 34, Risk: 10 },
  { name: 'Mar 19', Healthy: 38, Risk: 13 },
  { name: 'Mar 26', Healthy: 40, Risk: 11 },
  { name: 'Apr 2', Healthy: 42, Risk: 14 },
]

export default function Dashboard() {
  const [trendData, setTrendData] = useState<VulnerabilityTrend[]>([])
  const [loadingTrend, setLoadingTrend] = useState(true)
  const [trendError, setTrendError] = useState<string | null>(null)

  const [currentTotal, setCurrentTotal] = useState(0)
  const [currentCritical, setCurrentCritical] = useState(0)

  // Fetch Vulnerability Trend Data - Runs in parallel with other component loads
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoadingTrend(true)
        const response = await graphqlQuery<GetVulnerabilityTrendResponse>(
          GET_DASHBOARD_VULNERABILITY_TREND,
          { days: 90 }
        )
        
        // Reverted to accessing dashboardVulnerabilityTrend
        const data = response.dashboardVulnerabilityTrend
        setTrendData(data)

        // Update metrics based on the latest data point available
        if (data && data.length > 0) {
          const latest = data[data.length - 1]
          // Sum all 4 severities
          const total = (latest.critical || 0) + (latest.high || 0) + (latest.medium || 0) + (latest.low || 0)
          setCurrentTotal(total)
          setCurrentCritical(latest.critical)
        }
      } catch (err) {
        console.error('Error fetching dashboard trend:', err)
        setTrendError('Failed to load trend data')
      } finally {
        setLoadingTrend(false)
      }
    }

    fetchTrendData()
  }, [])

  // Format date for XAxis (e.g., "2025-06-01" -> "Jun 1")
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  // Safe fallback for charts to prevent crash if array is empty
  const chartData = trendData.length > 0 ? trendData : [{ date: '', critical: 0, high: 0, medium: 0, low: 0 }]

  return (
    <div className="space-y-6">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Critical (Swapped to position 1) */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Critical</h3>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-gray-900">
               {loadingTrend ? (
                 <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded"></span>
               ) : (
                 currentCritical
               )}
             </span>
          </div>
          <div className="flex items-center gap-2 mt-4">
             <LocalFireDepartmentIcon className="text-red-500" style={{ fontSize: '1.25rem' }} />
             <span className="text-gray-600 font-medium">active</span>
             <div className="h-8 w-24 ml-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Total open vulnerabilities (Swapped to position 2) */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Total open vulnerabilities</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">
              {loadingTrend ? (
                <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded"></span>
              ) : (
                currentTotal
              )}
            </span>
          </div>
          <div className="h-10 mt-2">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                   <Area 
                     type="monotone" 
                     dataKey="low" 
                     stackId="1" 
                     stroke={COLORS.low} 
                     fill={COLORS.low} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey="medium" 
                     stackId="1" 
                     stroke={COLORS.medium} 
                     fill={COLORS.medium} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey="high" 
                     stackId="1" 
                     stroke={COLORS.high} 
                     fill={COLORS.high} 
                   />
                   <Area 
                     type="monotone" 
                     dataKey="critical" 
                     stackId="1" 
                     stroke={COLORS.critical} 
                     fill={COLORS.critical} 
                   />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Mean time to remediation */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Mean time to remediation</h3>
          <span className="text-4xl font-bold text-gray-900">12.5 days</span>
          <div className="flex items-center gap-2 mt-4 text-gray-500">
             <ScheduleIcon className="text-orange-400" />
             <span className="text-sm">Target: 7 days</span>
             <div className="h-8 w-24 ml-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <Line type="monotone" dataKey="days" stroke="#f97316" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* % vulnerabilities remediated */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">% of vulnerabilities remediated</h3>
          <span className="text-4xl font-bold text-gray-900">76%</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6">
            <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '76%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">Last 30 days</p>
        </div>
      </div>

      {/* Middle Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Vulnerabilities over time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6">Vulnerabilities over time</h3>
          <div className="h-64">
            {loadingTrend ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : trendError ? (
              <div className="flex items-center justify-center h-full text-red-500 text-sm">
                {trendError}
              </div>
            ) : trendData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}} 
                    tickFormatter={formatDate}
                    minTickGap={30}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  {/* Stacked Areas: Low on bottom, Critical on top */}
                  <Area 
                    type="monotone" 
                    dataKey="low" 
                    stackId="1" 
                    stroke="none" 
                    fill={COLORS.low} 
                    fillOpacity={1} 
                    name="Low"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="medium" 
                    stackId="1" 
                    stroke="none" 
                    fill={COLORS.medium} 
                    fillOpacity={1} 
                    name="Medium"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="high" 
                    stackId="1" 
                    stroke="none" 
                    fill={COLORS.high} 
                    fillOpacity={1} 
                    name="High"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="critical" 
                    stackId="1" 
                    stroke="none" 
                    fill={COLORS.critical} 
                    fillOpacity={1} 
                    name="Critical"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
             <div className="flex items-center gap-2 text-sm text-gray-600">
               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.critical }}></span> Critical
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-600">
               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.high }}></span> High
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-600">
               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.medium }}></span> Medium
             </div>
             <div className="flex items-center gap-2 text-sm text-gray-600">
               <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.low }}></span> Low
             </div>
          </div>
        </div>

        {/* Mean time to remediation Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6">Remediation Velocity (Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <ReferenceLine y={10} stroke="#9ca3af" strokeDasharray="3 3" label={{ value: 'Target', position: 'insideTopRight', fill: '#9ca3af', fontSize: 12 }} />
                <Line type="monotone" dataKey="days" stroke="#ea580c" strokeWidth={3} dot={{ r: 4, fill: '#ea580c', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             <p className="text-sm text-gray-500">Average time to close vulnerabilities across all projects</p>
          </div>
        </div>

      </div>

      {/* Bottom Row: Endpoint Health */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
         <h3 className="text-gray-900 font-medium mb-6">Endpoint Remediation Health</h3>
         <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart
                  data={barData}
                  barSize={16}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
               >
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} interval={1} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="Risk" stackId="a" fill="#f87171" name="At Risk" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="Healthy" stackId="a" fill="#4ade80" name="Healthy" radius={[4, 4, 0, 0]} />
               </BarChart>
            </ResponsiveContainer>
         </div>
         <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-green-400"></span> Healthy Endpoints</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-red-400"></span> Endpoints with Critical Issues</div>
         </div>
      </div>
    </div>
  )
}