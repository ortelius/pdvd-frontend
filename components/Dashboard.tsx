'use client'

import React from 'react'
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

// Mock Data for "Vulnerabilities over time"
const areaData = [
  { name: 'Jan 1', Low: 70, Medium: 50, High: 80, Critical: 10 },
  { name: 'Jan 8', Low: 75, Medium: 55, High: 75, Critical: 15 },
  { name: 'Jan 15', Low: 90, Medium: 55, High: 80, Critical: 12 },
  { name: 'Jan 22', Low: 80, Medium: 50, High: 80, Critical: 18 },
  { name: 'Feb 1', Low: 100, Medium: 60, High: 90, Critical: 20 },
  { name: 'Feb 15', Low: 90, Medium: 70, High: 85, Critical: 25 },
  { name: 'Mar 1', Low: 105, Medium: 70, High: 90, Critical: 22 },
  { name: 'Mar 15', Low: 125, Medium: 100, High: 95, Critical: 30 },
  { name: 'Apr 1', Low: 110, Medium: 80, High: 100, Critical: 28 },
  { name: 'Apr 15', Low: 120, Medium: 95, High: 105, Critical: 35 },
]

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
  return (
    <div className="space-y-6">
      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total open vulnerabilities */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Total open vulnerabilities</h3>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-bold text-gray-900">342</span>
          </div>
          <div className="h-10 mt-2">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                   <Line type="monotone" dataKey="days" stroke="#eab308" strokeWidth={2} dot={false} />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Critical */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Critical</h3>
          <div className="flex items-end gap-2">
             <span className="text-4xl font-bold text-gray-900">123</span>
             <span className="text-sm text-red-600 font-medium mb-1">↑ 12%</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
             <span className="material-symbols-outlined text-red-500 text-xl">local_fire_department</span>
             <span className="text-gray-600 font-medium">123 active</span>
             <div className="h-8 w-24 ml-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <Line type="monotone" dataKey="days" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Mean time to remediation */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-gray-900 font-medium mb-2">Mean time to remediation</h3>
          <span className="text-4xl font-bold text-gray-900">12.5 days</span>
          <div className="flex items-center gap-2 mt-4 text-gray-500">
             <span className="material-symbols-outlined text-orange-400">schedule</span>
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="Low" stackId="1" stroke="none" fill="#dbeafe" fillOpacity={1} />
                <Area type="monotone" dataKey="Medium" stackId="1" stroke="none" fill="#fef9c3" fillOpacity={1} />
                <Area type="monotone" dataKey="High" stackId="1" stroke="none" fill="#ffedd5" fillOpacity={1} />
                <Area type="monotone" dataKey="Critical" stackId="1" stroke="none" fill="#fee2e2" fillOpacity={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
             <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-200"></span> Critical</div>
             <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-orange-100 border border-orange-200"></span> High</div>
             <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-yellow-100 border border-yellow-200"></span> Medium</div>
             <div className="flex items-center gap-2 text-sm text-gray-600"><span className="w-3 h-3 rounded-full bg-blue-100 border border-blue-200"></span> Low</div>
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