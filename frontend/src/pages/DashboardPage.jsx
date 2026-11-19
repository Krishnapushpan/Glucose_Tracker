import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Droplet,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import ReportCard from '../components/ReportCard';
import ReadingForm from '../components/ReadingForm';
import ReadingTable from '../components/ReadingTable';

function getTodayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const today = useMemo(() => getTodayString(), []);

  const [readings, setReadings] = useState([]);
  const [report, setReport] = useState({
    highest: null,
    lowest: null,
    average: null,
    count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [readingsData, reportData] = await Promise.all([
        apiRequest('/readings'),
        apiRequest(`/reports/daily?date=${today}`).catch(() => ({ report: {} })),
      ]);

      setReadings(readingsData.readings || []);
      if (reportData.report) {
        setReport({
          highest: reportData.report.highest ?? null,
          lowest: reportData.report.lowest ?? null,
          average: reportData.report.average ?? null,
          count: reportData.report.count ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [today]);

  const [editingReading, setEditingReading] = useState(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDeleteReading(id) {
    if (!window.confirm('Are you sure you want to delete this reading?')) return;
    try {
      await apiRequest(`/readings/${id}`, { method: 'DELETE' });
      if (editingReading?.id === id) {
        setEditingReading(null);
      }
      loadData();
    } catch (err) {
      alert(err.message || 'Could not delete reading.');
    }
  }

  function handleEditReading(reading) {
    setEditingReading(reading);
    document.getElementById('reading-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleCancelEdit() {
    setEditingReading(null);
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  // Find slots already entered today so the form can indicate them
  const existingTodaySlots = useMemo(() => {
    return readings
      .filter((r) => String(r.date).slice(0, 10) === today)
      .map((r) => r.slot);
  }, [readings, today]);

  return (
    <div className="bg-paper-grain relative min-h-screen overflow-x-clip bg-[#f1f6f3] text-[#2d4742]">
      {/* Ambient background accents matching landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#9ad2c3]/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-1/4 h-96 w-96 rounded-full bg-[#b5dfd3]/35 blur-3xl"
      />

      {/* Top Navigation */}
      <header className="sticky top-0 z-20 border-b border-[#48a992]/15 bg-[#fafcf9]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="group flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#48a992] text-white shadow-sm shadow-[#267464]/20 transition-transform duration-200 group-hover:scale-105">
              <Droplet className="h-5 w-5 fill-[#ec4d43] text-[#faf7f4]" aria-hidden="true" />
            </span>
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-[#267464] sm:text-3xl">
                Sweetly
              </span>
              <span className="ml-2.5 hidden rounded-full bg-[#e3f1eb] px-2.5 py-0.5 text-xs font-semibold text-[#267464] sm:inline-block">
                Patient Dashboard
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-[#267464] md:inline-block">
              {user?.name || 'User'}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-[#48a992]/30 bg-white px-4 py-2 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48a992]"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#267464] sm:text-3xl">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-sm text-[#5b7670]">
              Track your blood sugar levels and monitor today&apos;s summary metrics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 self-start rounded-full border border-[#48a992]/25 bg-[#fafcf9] px-3.5 py-1.5 text-xs font-semibold text-[#267464] shadow-sm transition-all hover:bg-[#e3f1eb] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Today's Summary Cards using ReportCard */}
        <section aria-label="Today's Glucose Summary" className="mt-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <ReportCard
              label="Today's Average"
              value={report.average}
              unit="mg/dL"
              subtext="Target: 70–140 mg/dL"
              icon={Activity}
              accent="teal"
            />
            <ReportCard
              label="Today's Highest"
              value={report.highest}
              unit="mg/dL"
              subtext={report.highest && report.highest > 140 ? 'Elevated' : 'Normal'}
              icon={ArrowUpRight}
              accent="coral"
            />
            <ReportCard
              label="Today's Lowest"
              value={report.lowest}
              unit="mg/dL"
              subtext={report.lowest && report.lowest < 70 ? 'Low' : 'In range'}
              icon={ArrowDownRight}
              accent="sage"
            />
            <ReportCard
              label="Today's Readings"
              value={report.count}
              unit="/ 4 slots"
              subtext="Max 4 checks per day"
              icon={ClipboardList}
              accent="forest"
            />
          </div>
        </section>

        {/* Two-column layout: Form & Table */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left: Input Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <ReadingForm
              onReadingAdded={() => loadData()}
              onReadingUpdated={() => {
                setEditingReading(null);
                loadData();
              }}
              editingReading={editingReading}
              onCancelEdit={handleCancelEdit}
              allReadings={readings}
            />
          </div>

          {/* Right: Readings History Table */}
          <div className="lg:col-span-7 xl:col-span-8">
            <ReadingTable
              readings={readings}
              onDeleteReading={handleDeleteReading}
              onEditReading={handleEditReading}
              editingReadingId={editingReading?.id}
              loading={loading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
