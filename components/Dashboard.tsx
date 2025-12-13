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

import { 
  graphqlQuery, 
  GET_DASHBOARD_VULNERABILITY_TREND,
  GET_DASHBOARD_GLOBAL_STATUS,
  GET_MTTR_ANALYSIS,
  GET_MTTR_TREND,
  GET_MTTR_BY_ENDPOINT,
  GET_MTTR_BY_PACKAGE,
  GET_MTTR_BY_DISCLOSURE
} from '@/lib/graphql'
import { GetVulnerabilityTrendResponse, VulnerabilityTrend } from '@/lib/types'

// --- Material UI Icons ---
import ScheduleIcon from '@mui/icons-material/Schedule'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import RemoveIcon from '@mui/icons-material/Remove'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import BusinessIcon from '@mui/icons-material/Business'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import CompareArrowsIcon from '@mui/icons-material/CompareArrows'

// --- Types ---
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

interface MTTRAnalysis {
  by_severity: Array<{
    severity: string
    mean_days: number
    median_days: number
    min_days: number
    max_days: number
    sample_size: number
  }>
  overall_mean_days: number
  analysis_period: number
  total_remediated: number
}

interface MTTRTrend {
  month: string
  avg_mttr: number
  count: number
}

interface MTTREndpoint {
  endpoint_name: string
  avg_mttr: number
  count: number
}

interface MTTRPackage {
  package: string
  avg_mttr: number
  count: number
}

interface MTTRDisclosure {
  known_at_deployment: {
    count: number
    mean_mttr: number
    median_mttr: number
  }
  disclosed_after_deployment: {
    count: number
    mean_mttr: number
    median_mttr: number
  }
}

// --- Color Palette ---
const COLORS = {
  low: 'rgb(79, 121, 255)',      // Blue
  medium: 'rgb(255, 206, 84)',   // Yellow/Gold
  high: 'rgb(255, 144, 79)',     // Orange
  critical: 'rgb(185, 28, 28)'   // Red
}

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6'
}

// Mock Data for endpoint health
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

  // MTTR State
  const [loadingMTTR, setLoadingMTTR] = useState(true)
  const [mttrAnalysis, setMttrAnalysis] = useState<MTTRAnalysis | null>(null)
  const [mttrTrend, setMttrTrend] = useState<MTTRTrend[]>([])
  const [mttrByEndpoint, setMttrByEndpoint] = useState<MTTREndpoint[]>([])
  const [mttrByPackage, setMttrByPackage] = useState<MTTRPackage[]>([])
  const [mttrByDisclosure, setMttrByDisclosure] = useState<MTTRDisclosure | null>(null)

  // 1. Fetch Vulnerability Trend Data
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

  // 2. Fetch Endpoint Status Data
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

  // 3. Fetch MTTR Data
  useEffect(() => {
    const fetchMTTRData = async () => {
      try {
        setLoadingMTTR(true)
        const days = 90

        const [analysisRes, trendRes, endpointRes, packageRes, disclosureRes] = await Promise.all([
          graphqlQuery<{ dashboardMTTR: MTTRAnalysis }>(GET_MTTR_ANALYSIS, { days }),
          graphqlQuery<{ dashboardMTTRTrend: MTTRTrend[] }>(GET_MTTR_TREND, { days: 180 }),
          graphqlQuery<{ dashboardMTTRByEndpoint: MTTREndpoint[] }>(GET_MTTR_BY_ENDPOINT, { days, limit: 10 }),
          graphqlQuery<{ dashboardMTTRByPackage: MTTRPackage[] }>(GET_MTTR_BY_PACKAGE, { days, limit: 10 }),
          graphqlQuery<{ dashboardMTTRByDisclosureType: MTTRDisclosure }>(GET_MTTR_BY_DISCLOSURE, { days })
        ])

        setMttrAnalysis(analysisRes.dashboardMTTR)
        setMttrTrend(trendRes.dashboardMTTRTrend)
        setMttrByEndpoint(endpointRes.dashboardMTTRByEndpoint)
        setMttrByPackage(packageRes.dashboardMTTRByPackage)
        setMttrByDisclosure(disclosureRes.dashboardMTTRByDisclosureType)
      } catch (err) {
        console.error('Error fetching MTTR data:', err)
      } finally {
        setLoadingMTTR(false)
      }
    }
    fetchMTTRData()
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
      
      {/* Top Row: Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Vulnerability Count Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Vulnerability Count</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['critical', 'high', 'medium', 'low'] as const).map((severity) => {
              const metric = metrics[severity]
              const color = COLORS[severity]
              
              return (
                <div key={severity} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative overflow-hidden h-full min-h-[100px]">
                  {/* Colored accent bar on left */}
                  <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }}></div>
                  
                  {/* Header */}
                  <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2 ml-1">{severity}</h3>
                  
                  {/* Content - Applied Color to Wrapper & Right Aligned */}
                  <div className="flex flex-col gap-1 items-end mt-auto" style={{ color: color }}>
                    {/* Count */}
                    <span className="text-2xl font-bold leading-none">
                      {loadingStatus ? (
                        <span className="inline-block w-12 h-6 bg-gray-200 animate-pulse rounded"></span>
                      ) : (
                        metric.count
                      )}
                    </span>
                    
                    {/* Delta */}
                    <div className="flex items-center text-xl font-bold leading-none">
                      {loadingStatus ? null : metric.delta > 0 ? (
                        <ArrowUpwardIcon fontSize="inherit" />
                      ) : metric.delta < 0 ? (
                        <ArrowDownwardIcon fontSize="inherit" />
                      ) : (
                        <RemoveIcon fontSize="inherit" />
                      )}
                      <span className="ml-1">{loadingStatus ? '' : Math.abs(metric.delta)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: MTTR Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Mean Time to Remediation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((severity) => {
              const data = mttrAnalysis?.by_severity?.find((s) => s.severity === severity)
              const color = SEVERITY_COLORS[severity]
              
              return (
                <div key={severity} className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-full min-h-[100px]">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <ScheduleIcon sx={{ width: 16, height: 16, color }} />
                    <h4 className="text-xs font-semibold text-gray-700">{severity}</h4>
                  </div>
                  
                  {/* Content */}
                  {loadingMTTR ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="text-2xl font-bold leading-none" style={{ color }}>
                        {data?.mean_days?.toFixed(1) || 'N/A'}
                        {data?.mean_days && <span className="text-sm text-gray-500 ml-1">days</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        {data?.sample_size || 0} remediated
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Second Row: MTTR by Severity Cards - REMOVED */}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Post-Deployment Vulnerabilities over time */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6">Post-Deployment Vulnerabilities over time</h3>
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
                  <Area type="monotone" dataKey="low" stackId="1" stroke="none" fill={COLORS.low} fillOpacity={1} name="Low" />
                  <Area type="monotone" dataKey="medium" stackId="1" stroke="none" fill={COLORS.medium} fillOpacity={1} name="Medium" />
                  <Area type="monotone" dataKey="high" stackId="1" stroke="none" fill={COLORS.high} fillOpacity={1} name="High" />
                  <Area type="monotone" dataKey="critical" stackId="1" stroke="none" fill={COLORS.critical} fillOpacity={1} name="Critical" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
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

        {/* MTTR Trend Chart */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6 flex items-center gap-2">
            <TrendingUpIcon sx={{ width: 20, height: 20, color: 'rgb(37, 99, 235)' }} />
            MTTR Trend (Last 6 Months)
          </h3>
          <div className="h-64">
            {loadingMTTR ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mttrTrend}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: any) => [`${value.toFixed(1)} days`, 'Avg MTTR']}
                  />
                  <Line type="monotone" dataKey="avg_mttr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* MTTR Performance Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 10 Fastest Endpoints */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6 flex items-center gap-2">
            <BusinessIcon sx={{ width: 20, height: 20, color: 'rgb(34, 197, 94)' }} />
            Top 10 Fastest Endpoints
          </h3>
          <div className="h-80">
            {loadingMTTR ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : mttrByEndpoint.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No endpoint data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mttrByEndpoint}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                  <YAxis 
                    type="category" 
                    dataKey="endpoint_name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 11}}
                    width={110}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: any) => [`${value.toFixed(1)} days`, 'Avg MTTR']}
                  />
                  <Bar dataKey="avg_mttr" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top 10 Slowest Packages */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6 flex items-center gap-2">
            <Inventory2Icon sx={{ width: 20, height: 20, color: 'rgb(239, 68, 68)' }} />
            Top 10 Slowest Packages
          </h3>
          <div className="h-80">
            {loadingMTTR ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : mttrByPackage.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No package data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mttrByPackage}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                  <YAxis 
                    type="category" 
                    dataKey="package" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 11}}
                    width={110}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: any) => [`${value.toFixed(1)} days`, 'Avg MTTR']}
                  />
                  <Bar dataKey="avg_mttr" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Health & Disclosure Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Endpoint Remediation Health */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6">Endpoint Remediation Health</h3>
          <div className="h-64">
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

        {/* Disclosure Timing Comparison */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-6 flex items-center gap-2">
            <CompareArrowsIcon sx={{ width: 20, height: 20, color: 'rgb(147, 51, 234)' }} />
            Disclosure Timing Comparison
          </h3>
          <div className="h-64">
            {loadingMTTR ? (
              <div className="flex items-center justify-center h-full">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : !mttrByDisclosure ? (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No disclosure data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      disclosure_type: 'Known at Deployment',
                      avg_mttr: mttrByDisclosure.known_at_deployment.mean_mttr
                    },
                    {
                      disclosure_type: 'Disclosed After',
                      avg_mttr: mttrByDisclosure.disclosed_after_deployment.mean_mttr
                    }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="disclosure_type" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#6b7280', fontSize: 12}}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: any) => [`${value.toFixed(1)} days`, 'Avg MTTR']}
                  />
                  <Bar dataKey="avg_mttr" fill="#9333ea" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}