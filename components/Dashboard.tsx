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
import ScheduleIcon from '@mui/icons-material/Schedule'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import RemoveIcon from '@mui/icons-material/Remove'

// --- New GraphQL Definitions (Add to lib/graphql in production) ---
const GET_DASHBOARD_GLOBAL_STATUS = `
  query DashboardGlobalStatus($limit: Int) {
    dashboardGlobalStatus(limit: $limit) {
      critical { count delta }
      high { count delta }
      medium { count delta }
      low { count delta }
      total_count
      total_delta
    }
  }
`

// --- Types for New Query ---
interface SeverityMetric {
  count: number
  delta: number
}

interface DashboardGlobalStatus {
  critical: SeverityMetric
  high: SeverityMetric
  medium: SeverityMetric
  low: SeverityMetric
  total_count: number
  total_delta: number
}

interface GetDashboardGlobalStatusResponse {
  dashboardGlobalStatus: DashboardGlobalStatus
}

// --- Color Palette ---
const COLORS = {
  low: 'rgb(79, 121, 255)',      // Blue
  medium: 'rgb(255, 206, 84)',   // Yellow/Gold
  high: 'rgb(255, 144, 79)',     // Orange
  critical: 'rgb(185, 28, 28)'   // Red
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

  const [loadingStatus, setLoadingStatus] = useState(true)
  const [metrics, setMetrics] = useState<DashboardGlobalStatus>({
    critical: { count: 0, delta: 0 },
    high: { count: 0, delta: 0 },
    medium: { count: 0, delta: 0 },
    low: { count: 0, delta: 0 },
    total_count: 0,
    total_delta: 0
  })

  // 1. Fetch Vulnerability Trend Data (For Charts)
  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        setLoadingTrend(true)
        const response = await graphqlQuery<GetVulnerabilityTrendResponse>(
          GET_DASHBOARD_VULNERABILITY_TREND,
          { days: 90 }
        )
        setTrendData(response.dashboardVulnerabilityTrend)
      } catch (err) {
        console.error('Error fetching dashboard trend:', err)
        setTrendError('Failed to load trend data')
      } finally {
        setLoadingTrend(false)
      }
    }
    fetchTrendData()
  }, [])

  // 2. Fetch Endpoint Status Data (For Severity Cards)
  useEffect(() => {
    const fetchStatusData = async () => {
      try {
        setLoadingStatus(true)
        const response = await graphqlQuery<GetDashboardGlobalStatusResponse>(
          GET_DASHBOARD_GLOBAL_STATUS,
          { limit: 1000 }
        )
        if (response.dashboardGlobalStatus) {
          setMetrics(response.dashboardGlobalStatus)
        }
      } catch (err) {
        console.error('Error fetching dashboard status:', err)
      } finally {
        setLoadingStatus(false)
      }
    }
    fetchStatusData()
  }, [])

  // Format date for XAxis
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Severity Metrics (Critical, High, Medium, Low) */}
        {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
          const metric = metrics[severity]
          const color = COLORS[severity]
          
          return (
            <div key={severity} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm relative overflow-hidden">
              {/* Colored accent bar on left */}
              <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }}></div>
              
              <h3 className="text-gray-900 font-medium mb-2 capitalize">{severity}</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-gray-900">
                  {loadingStatus ? (
                    <span className="inline-block w-16 h-8 bg-gray-200 animate-pulse rounded"></span>
                  ) : (
                    metric.count
                  )}
                </span>
                
                {!loadingStatus && (
                  <div className={`flex items-center text-sm mb-1 font-medium ${
                    metric.delta > 0 ? 'text-red-600' : metric.delta < 0 ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {metric.delta > 0 ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : metric.delta < 0 ? (
                      <ArrowDownwardIcon fontSize="small" />
                    ) : (
                      <RemoveIcon fontSize="small" />
                    )}
                    <span className="ml-0.5">{Math.abs(metric.delta)}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

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
        
        {/* Post-Deployment Vulnerabilties over time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6">Post-Deployment Vulnerabilties over time</h3>
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