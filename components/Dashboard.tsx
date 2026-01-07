'use client'

import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'

import { 
  graphqlQuery, 
  GET_DASHBOARD_VULNERABILITY_TREND,
  GET_MTTR_ANALYSIS,
  GET_DASHBOARD_GLOBAL_STATUS
} from '@/lib/graphql'
import { 
  GetVulnerabilityTrendResponse, 
  VulnerabilityTrend,
  GetMTTRAnalysisResponse,
  MTTRAnalysis,
  GetDashboardGlobalStatusResponse,
  DashboardGlobalStatus
} from '@/lib/types'

// --- Icons ---
import ScheduleIcon from '@mui/icons-material/Schedule'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import BugReportIcon from '@mui/icons-material/BugReport'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import RouterIcon from '@mui/icons-material/Router'
import TimerIcon from '@mui/icons-material/Timer'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// --- Constants ---
const COLORS = {
  CRITICAL: '#dc2626',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
  NONE: '#9ca3af'
}

// Skeleton Components
const SkeletonCard = () => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-full">
    <Skeleton circle width={40} height={40} />
    <Skeleton width="75%" style={{ marginTop: 12 }} />
    <Skeleton width="50%" height={32} style={{ marginTop: 8 }} />
    <Skeleton count={2} style={{ marginTop: 12 }} />
  </div>
)

const SkeletonTable = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
      <Skeleton width="40%" height={24} />
    </div>
    <div className="overflow-x-auto flex-1 p-6">
      <Skeleton count={6} height={40} style={{ marginTop: 8 }} />
    </div>
  </div>
)

const SkeletonChart = ({ height = '400px' }: { height?: string }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ minHeight: height }}>
    <Skeleton width="50%" height={24} style={{ marginBottom: 24 }} />
    <Skeleton height={parseInt(height) - 100} />
  </div>
)

const SkeletonVelocityCard = () => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ minHeight: '500px' }}>
    <Skeleton width="70%" height={24} style={{ marginBottom: 16 }} />
    <div className="grid grid-cols-2 gap-4 mb-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i}>
          <Skeleton count={3} />
        </div>
      ))}
    </div>
    <div className="pt-6 border-t border-gray-200">
      <Skeleton count={3} height={60} />
    </div>
  </div>
)

export default function Dashboard() {
  const [trendData, setTrendData] = useState<VulnerabilityTrend[]>([])
  const [loadingTrend, setLoadingTrend] = useState(true)
  
  const [mttrData, setMttrData] = useState<MTTRAnalysis | null>(null)
  const [loadingMttr, setLoadingMttr] = useState(true)
  
  const [globalStatus, setGlobalStatus] = useState<DashboardGlobalStatus | null>(null)
  const [loadingGlobalStatus, setLoadingGlobalStatus] = useState(true)
  
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoadingMttr(true)
        const response = await graphqlQuery<GetMTTRAnalysisResponse>(
          GET_MTTR_ANALYSIS, 
          { days: 180 }
        )
        setMttrData(response.dashboardMTTR)
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err)
        setError('Failed to load dashboard metrics')
      } finally {
        setLoadingMttr(false)
      }
    }
    fetchMetrics()
  }, [])

  useEffect(() => {
    const fetchGlobalStatus = async () => {
      try {
        setLoadingGlobalStatus(true)
        const response = await graphqlQuery<GetDashboardGlobalStatusResponse>(
          GET_DASHBOARD_GLOBAL_STATUS
        )
        setGlobalStatus(response.dashboardGlobalStatus)
      } catch (err) {
        console.error('Error fetching global status:', err)
      } finally {
        setLoadingGlobalStatus(false)
      }
    }
    fetchGlobalStatus()
  }, [])

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        setLoadingTrend(true)
        const response = await graphqlQuery<GetVulnerabilityTrendResponse>(
          GET_DASHBOARD_VULNERABILITY_TREND,
          { days: 180 }
        )
        
        const rawData = response.dashboardVulnerabilityTrend
        
        const firstActiveIndex = rawData.findIndex(d => 
          (d.critical + d.high + d.medium + d.low) > 0
        )

        if (firstActiveIndex > 0) {
          const startIndex = Math.max(0, firstActiveIndex - 1)
          setTrendData(rawData.slice(startIndex))
        } else {
          setTrendData(rawData)
        }

      } catch (err) {
        console.error('Error fetching trend:', err)
      } finally {
        setLoadingTrend(false)
      }
    }
    fetchTrend()
  }, [])

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch { return dateStr }
  }

  const ExecutiveCard = ({ title, value, subValue, icon: Icon, colorClass, tooltip, compliance }: any) => (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
          <Icon className={colorClass} />
        </div>
        {compliance && (
          <div className="text-[10px] text-gray-400 text-right leading-tight">
            {compliance}
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
      </div>
      {tooltip && (
        <div className="mt-auto pt-3 border-t border-gray-100 text-xs text-gray-400 leading-relaxed">
          {tooltip}
        </div>
      )}
    </div>
  )

  if (loadingMttr || loadingGlobalStatus) {
    return (
      <div className="flex-1 p-6 bg-gray-50 min-h-screen space-y-8 font-sans overflow-y-auto">
        <div className="flex justify-between items-end">
          <div className="flex-1">
            <Skeleton width="60%" height={32} />
            <div className="flex gap-2 mt-2">
              <Skeleton width={120} height={24} />
              <Skeleton width={140} height={24} />
              <Skeleton width={200} height={24} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonTable />
          </div>
          <div>
            <SkeletonChart height="400px" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SkeletonChart height="500px" />
          </div>
          <div>
            <SkeletonVelocityCard />
          </div>
        </div>
      </div>
    )
  }

  if (error || !mttrData) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-block">
          <h3 className="font-bold">Error Loading Dashboard</h3>
          <p>{error || 'No data available'}</p>
        </div>
      </div>
    )
  }

  const { executive_summary, by_severity } = mttrData

  const volumeChartData = by_severity.map(s => ({
    name: s.severity,
    New: s.new_detected,
    Fixed: s.remediated
  }))

  return (
    <div className="flex h-full relative">
      <div className="flex-1 p-6 bg-gray-50 min-h-screen space-y-8 font-sans overflow-y-auto">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Post-Deployment OSS Vulnerability Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold border border-blue-200">Rolling 180 Days</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold border border-green-200">Endpoint Focused</span>
              
              <div className="relative group">
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-semibold border border-purple-200 cursor-help flex items-center gap-1">
                  <span>SLA Policy</span>
                  <span className="w-1 h-1 rounded-full bg-purple-400"></span>
                  <span className="font-normal opacity-80">Crit 15d • High 30d</span>
                </span>
                
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-4 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <ScheduleIcon fontSize="small" className="text-purple-600" />
                    <h4 className="font-bold text-gray-900 text-sm">SLA Remediation Targets</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div className="col-span-1 font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Severity</div>
                    <div className="col-span-1 text-right font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Standard SLA</div>

                    <div className="col-span-1 font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span> Critical
                    </div>
                    <div className="col-span-1 text-right text-gray-600">15 days</div>

                    <div className="col-span-1 font-bold text-gray-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span> High
                    </div>
                    <div className="col-span-1 text-right text-gray-600">30 days</div>

                    <div className="col-span-1 font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium
                    </div>
                    <div className="col-span-1 text-right text-gray-600">90 days</div>

                    <div className="col-span-1 font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> Low
                    </div>
                    <div className="col-span-1 text-right text-gray-600">180 days</div>
                  </div>
                  
                  <div className="mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 italic">
                    Clock starts at first detection on a deployed endpoint.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <ExecutiveCard 
            title="Total New CVEs" 
            value={executive_summary.total_new_cves}
            subValue="in period"
            icon={BugReportIcon}
            colorClass="text-red-600"
            compliance={<a href="#nist-800-218-rv1" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.1</a>}
            tooltip={
              <span>
                Total vulnerabilities detected within the rolling 180-day window.<br/>
                <strong>Calculation:</strong> Σ CVEs where <em>Detected Date</em> is within last 180 days.
              </span>
            }
          />
          <ExecutiveCard 
            title="Post-Deploy CVEs" 
            value={executive_summary.post_deployment_cves}
            subValue="active open"
            icon={RouterIcon}
            colorClass="text-orange-600"
            compliance={<a href="#nist-800-218-rv1" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.1</a>}
            tooltip={
              <span>
                Currently open vulnerabilities affecting deployed endpoints.<br/>
                <strong>Calculation:</strong> Σ Open CVEs where <em>Disclosure Date</em> &gt; <em>Deployment Date</em>.
              </span>
            }
          />
          <ExecutiveCard 
            title="MTTR (All)" 
            value={`${executive_summary.mttr_all.toFixed(1)}d`}
            subValue="avg remediation"
            icon={ScheduleIcon}
            colorClass="text-blue-600"
            compliance={<><a href="#nist-800-218-rv2" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.2</a><br/><a href="#nist-800-53-si2" className="text-blue-600 underline hover:text-blue-800">NIST 800-53 SI-2</a></>}
            tooltip={
              <span>
                Mean Time To Remediate for all endpoint CVEs fixed in the last 180 days.<br/>
                <strong>Calculation:</strong> Σ(<em>Fix Date</em> - <em>Detect Date</em>) / Total Fixed CVEs.
              </span>
            }
          />
          <ExecutiveCard 
            title="MTTR (Post-Deploy)" 
            value={`${executive_summary.mttr_post_deployment.toFixed(1)}d`}
            subValue=""
            icon={AccessTimeIcon}
            colorClass="text-indigo-600"
            compliance={<><a href="#nist-800-218-rv2" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.2</a><br/><a href="#nist-800-190-s33" className="text-blue-600 underline hover:text-blue-800">NIST 800-190 §3.3</a></>}
            tooltip={
              <span>
                Mean Time To Remediate for Post-Deployment CVEs only.<br/>
                <strong>Calculation:</strong> Σ(<em>Fix Date</em> - <em>Detect Date</em>) / Total Fixed Post-Deploy CVEs.
              </span>
            }
          />
          <ExecutiveCard 
            title="% Open > SLA" 
            value={`${executive_summary.open_cves_beyond_sla_pct.toFixed(1)}%`}
            subValue="compliance risk"
            icon={WarningAmberIcon}
            colorClass="text-yellow-600"
            compliance={<><a href="#nist-800-218-rv2" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.2</a><br/><a href="#nist-800-190-s32" className="text-blue-600 underline hover:text-blue-800">NIST 800-190 §3.2</a></>}
            tooltip={
              <span>
                Percentage of open CVEs exceeding their severity-based SLA.<br/>
                <strong>Calculation:</strong> (Count of Open CVEs &gt; SLA Days / Total Open CVEs) * 100.
              </span>
            }
          />
        </div>
        
        {/* ... (Rest of Dashboard component remains the same) ... */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Severity Breakdown & SLA Compliance</h2>
                <a href="#nist-800-218-rv2" className="text-xs text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.2</a>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3">Severity</th>
                    <th className="px-6 py-3 text-center">
                      <div>MTTR (Days)</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">Σ(Fix - Detect) / Fixed</div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div>MTTR (Post)</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">Σ(Fix - Detect) / Post-deploy fixed</div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div>% Fixed in SLA</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">(Fixed ≤ SLA / Total) × 100</div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div>Mean Age</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">Σ(Now - Detect) / Open</div>
                    </th>
                    <th className="px-6 py-3 text-center">
                      <div>Oldest</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">Max open age</div>
                    </th>
                    <th className="px-6 py-3 text-center text-red-600">
                      <div>% &gt; SLA</div>
                      <div className="text-xs font-normal text-gray-400 mt-1">(Open &gt; SLA / Total) × 100</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {by_severity.map((row) => (
                    <tr key={row.severity} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[row.severity as keyof typeof COLORS] || COLORS.NONE }}></span>
                        {row.severity}
                      </td>
                      <td className="px-6 py-4 text-center">{row.mttr.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center font-medium text-gray-900">{row.mttr_post_deployment.toFixed(1)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.fixed_within_sla_pct >= 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {row.fixed_within_sla_pct.toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">{row.mean_open_age.toFixed(1)}d</td>
                      <td className="px-6 py-4 text-center text-gray-500">{row.oldest_open_days.toFixed(0)}d</td>
                      <td className="px-6 py-4 text-center font-bold text-red-600">
                        {row.open_beyond_sla_pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ minHeight: '400px' }}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Volume & Flow</h2>
              <span className="text-xs text-gray-400">
                <a href="#nist-800-218-rv1" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.1</a>, 
                <a href="#nist-800-218-rv2" className="text-blue-600 underline hover:text-blue-800 ml-1">RV.2</a>
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div>
                <p className="text-sm text-blue-800 font-bold">Backlog Delta</p>
                <p className="text-xs text-blue-600">New - Fixed</p>
              </div>
              <div className={`text-3xl font-bold ${executive_summary.backlog_delta > 0 ? 'text-red-600' : 'text-green-600'} flex items-center`}>
                {executive_summary.backlog_delta > 0 ? <TrendingUpIcon className="mr-1"/> : <TrendingDownIcon className="mr-1"/>}
                {Math.abs(executive_summary.backlog_delta)}
              </div>
            </div>

            <div className="flex-1" style={{ minHeight: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Bar dataKey="New" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Fixed" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ minHeight: '500px' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">Vulnerability Trend (180 Days)</h2>
              <span className="text-xs text-gray-400">
                <a href="#nist-800-218-rv1" className="text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.1</a> • <a href="#nist-800-137" className="text-blue-600 underline hover:text-blue-800">NIST 800-137</a>
              </span>
            </div>
            <div className="flex-1" style={{ minHeight: '400px' }}>
              {loadingTrend ? (
                <div className="flex items-center justify-center h-full text-gray-400">Loading trend...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.CRITICAL} stopOpacity={0.1}/>
                        <stop offset="95%" stopColor={COLORS.CRITICAL} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate} 
                      tick={{ fontSize: 12, fill: '#6b7280' }} 
                      axisLine={false} 
                      tickLine={false} 
                      minTickGap={30}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(l) => new Date(l).toLocaleDateString()}
                    />
                    <Area type="monotone" dataKey="low" stackId="1" stroke={COLORS.LOW} fill={COLORS.LOW} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke={COLORS.MEDIUM} fill={COLORS.MEDIUM} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="high" stackId="1" stroke={COLORS.HIGH} fill={COLORS.HIGH} fillOpacity={0.6} />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.CRITICAL} fill="url(#colorCritical)" fillOpacity={0.8} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col" style={{ minHeight: '500px' }}>
            <div className="mb-4 flex justify-between items-start">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Security Velocity & Impact Metrics</h2>
                <p className="text-xs text-gray-500 mt-1">Remediation effectiveness and exposure trends</p>
              </div>
              <a href="#nist-800-218-rv2" className="text-xs text-blue-600 underline hover:text-blue-800">NIST 800-218 RV.2</a>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              
              <ExecutiveCard
                title="Fix Velocity"
                value={(by_severity.reduce((acc, s) => acc + (s.remediated || 0), 0) / 26).toFixed(1)}
                subValue="CVEs Fixed/Week"
                icon={TrendingUpIcon}
                colorClass="text-emerald-600"
                tooltip={
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Last 180 days:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {by_severity.reduce((acc, s) => acc + (s.remediated || 0), 0)} total
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      <strong>Calculation:</strong> Σ Remediated / 26 weeks
                    </div>
                  </div>
                }
              />
              {/* ... (Rest of cards) ... */}
               <ExecutiveCard
                title="High-Risk Backlog"
                value={globalStatus?.high_risk_backlog ?? 
                       by_severity.filter(s => s.severity === 'Critical' || s.severity === 'High')
                       .reduce((acc, s) => acc + (s.open_count || 0), 0)}
                subValue="Critical + High Open"
                icon={WarningAmberIcon}
                colorClass="text-rose-600"
                tooltip={
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Past SLA:</span>
                      <span className="font-medium text-rose-600 ml-2">
                        {by_severity.filter(s => s.severity === 'Critical' || s.severity === 'High')
                         .reduce((acc, s) => acc + (s.open_beyond_sla_count || 0), 0)} CVEs
                      </span>
                    </div>
                    {globalStatus?.high_risk_delta !== undefined && globalStatus.high_risk_delta !== 0 && (
                      <div className="flex justify-between items-center">
                        <span>30d Change:</span>
                        <span className={`font-medium ml-2 ${globalStatus.high_risk_delta > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {globalStatus.high_risk_delta > 0 ? '+' : ''}{globalStatus.high_risk_delta}
                        </span>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400">
                      <strong>Calculation:</strong> Σ Open (Critical + High)
                    </div>
                  </div>
                }
              />

              <ExecutiveCard
                title="Shift-Left Success"
                value={executive_summary.total_new_cves > 0 
                       ? ((1 - (executive_summary.post_deployment_cves / executive_summary.total_new_cves)) * 100).toFixed(1) + '%'
                       : '0.0%'}
                subValue="Caught Pre-Deploy"
                icon={CheckCircleIcon}
                colorClass="text-indigo-600"
                tooltip={
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Pre-Deploy:</span>
                      <span className="font-medium text-gray-900 ml-2">
                        {executive_summary.total_new_cves - executive_summary.post_deployment_cves} CVEs
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      <strong>Calculation:</strong> (1 - Post-Deploy / Total) × 100
                    </div>
                  </div>
                }
              />

              <ExecutiveCard
                title="SLA Burn Rate"
                value={(() => {
                  const criticalSLA = 15;
                  const highSLA = 30;
                  const mediumSLA = 90;
                  const lowSLA = 180;
                  
                  let approaching = 0;
                  by_severity.forEach(s => {
                    const sla = s.severity === 'Critical' ? criticalSLA : 
                                s.severity === 'High' ? highSLA :
                                s.severity === 'Medium' ? mediumSLA : lowSLA;
                    const meanAge = s.mean_open_age || 0;
                    const openCount = s.open_count || 0;
                    if (meanAge >= sla - 30 && meanAge < sla) {
                      approaching += openCount;
                    }
                  });
                  return approaching;
                })()}
                subValue="Breach in 30d"
                icon={TimerIcon}
                colorClass="text-amber-600"
                tooltip={
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span>Already Past:</span>
                      <span className="font-medium text-amber-600 ml-2">
                        {by_severity.reduce((acc, s) => acc + (s.open_beyond_sla_count || 0), 0)} CVEs
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      <strong>Calculation:</strong> Σ Open where (SLA - Age) ≤ 30d
                    </div>
                  </div>
                }
              />
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(by_severity.reduce((acc, s) => acc + (s.open_count || 0) * (s.mean_open_age || 0), 0) / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs font-medium uppercase text-gray-500 tracking-wide">CVE-Days Exposure</div>
                  <div className="text-xs text-gray-400 mt-1">Σ(Open × Mean Age)</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {(() => {
                      const weeklyVelocity = by_severity.reduce((acc, s) => acc + (s.remediated || 0), 0) / 26;
                      const totalOpen = by_severity.reduce((acc, s) => acc + (s.open_count || 0), 0);
                      return weeklyVelocity > 0 ? (totalOpen / weeklyVelocity).toFixed(1) : '∞';
                    })()}
                  </div>
                  <div className="text-xs font-medium uppercase text-gray-500 tracking-wide">Weeks to Clear</div>
                  <div className="text-xs text-gray-400 mt-1">Open / Weekly Velocity</div>
                </div>
                <div className="flex flex-col">
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {by_severity.reduce((acc, s) => {
                      const criticalWeight = s.severity === 'Critical' ? 4 : s.severity === 'High' ? 3 : s.severity === 'Medium' ? 2 : 1;
                      return acc + (s.open_count || 0) * criticalWeight;
                    }, 0)}
                  </div>
                  <div className="text-xs font-medium uppercase text-gray-500 tracking-wide">Risk Score</div>
                  <div className="text-xs text-gray-400 mt-1">Weighted Open (C:4 H:3 M:2 L:1)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                📋 Compliance Framework Documentation
            </h2>
            {/* ... Content remains same ... */}
            <div className="space-y-8">
            <div id="nist-800-53">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-semibold">NIST SP 800-53 Rev. 5</span>
                Security and Privacy Controls for Information Systems
              </h3>
              <p className="text-sm text-gray-600 mb-4 italic">
                Published: December 2020 (Updated) | 
                <a href="https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                  Official Source ↗
                </a>
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-700 leading-relaxed">
                  <strong>Purpose:</strong> Provides a catalog of security and privacy controls for federal information systems and organizations to protect operations, assets, individuals, and the Nation from diverse threats including hostile attacks, human errors, and natural disasters.
                </p>
              </div>

              <div className="space-y-4 ml-4">
                <div id="nist-800-53-si2" className="border-l-2 border-indigo-400 pl-4">
                  <h4 className="font-bold text-gray-800 mb-2">
                    <a href="#nist-800-53-si2" className="text-indigo-700 hover:underline">SI-2</a>: Flaw Remediation (System and Information Integrity)
                  </h4>
                  <div className="bg-indigo-50 p-3 rounded text-sm text-gray-700 mb-3">
                    <p className="mb-2"><strong>Control Requirements:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>(a)</strong> Identify, report, and correct system flaws</li>
                      <li><strong>(b)</strong> Test software and firmware updates for effectiveness and potential side effects before installation</li>
                      <li><strong>(c)</strong> Install security-relevant software and firmware updates within organization-defined time periods</li>
                      <li><strong>(d)</strong> Incorporate flaw remediation into organizational configuration management process</li>
                    </ul>
                  </div>
                  <p className="text-sm text-gray-700 mb-2"><strong>Control Discussion (Excerpt):</strong></p>
                  <p className="text-sm text-gray-600 italic mb-3">
                    "The need to remediate system flaws applies to all types of software and firmware. Organizations identify systems affected by software flaws, including potential vulnerabilities resulting from those flaws, and report this information to designated organizational personnel. Organization-defined time periods for updating security-relevant software and firmware may vary based on risk factors, including the security category of the system, criticality of the update, organizational risk tolerance, mission supported, or threat environment."
                  </p>
                  <p className="text-sm text-gray-700 mt-3"><strong>Dashboard Implementation:</strong></p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-2">
                    <li><strong>MTTR Metrics:</strong> Demonstrate time-based flaw remediation tracking</li>
                    <li><strong>SLA Compliance:</strong> Shows adherence to organization-defined time periods for remediation</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* ... other compliance sections ... */}
            </div>
        </div>

      </div>
    </div>
  )
}