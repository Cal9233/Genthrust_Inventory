import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  CubeIcon, 
  CheckCircleIcon,
  ClockIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import aviationService, { DashboardStats } from '../services/aviation.service';
import { Stats, InventoryStats } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [aviationStats, setAviationStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [quoteResponse, inventoryResponse, aviationStatsData] = await Promise.all([
        api.get('/quotes/stats'),
        api.get('/inventory/stats'),
        aviationService.getStats()
      ]);
      setStats(quoteResponse.data.stats);
      setInventoryStats(inventoryResponse.data.stats);
      setAviationStats(aviationStatsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const statCards = [
    {
      name: 'Pending Quotes',
      stat: stats?.quotes.pending || 0,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      href: '/quotes?status=pending'
    },
    {
      name: 'Processed Quotes',
      stat: stats?.quotes.processed || 0,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      href: '/quotes?status=processed'
    },
    {
      name: 'Total Parts',
      stat: inventoryStats?.total_count || 0,
      icon: CubeIcon,
      color: 'bg-blue-500',
      href: '/inventory'
    },
    {
      name: 'Response Rate',
      stat: `${stats?.response_rate || 0}%`,
      icon: EnvelopeIcon,
      color: 'bg-purple-500',
      href: '/reports'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="mt-8">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${item.color}`}>
                  <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                  {item.name}
                </p>
              </dt>
              <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {item.stat}
                </p>
              </dd>
            </Link>
          ))}
        </dl>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/emails/sync"
              className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sync Emails
            </Link>
            <Link
              to="/inventory/sync"
              className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Sync Inventory
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Excel Inventory Status
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                Accurate Sheet Items
              </dt>
              <dd className="text-sm text-gray-900">
                {inventoryStats?.accurate_count || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                Inaccurate Sheet Items
              </dt>
              <dd className="text-sm text-gray-900">
                {inventoryStats?.inaccurate_count || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                Last Sync
              </dt>
              <dd className="text-sm text-gray-900">
                {inventoryStats?.last_sync 
                  ? new Date(inventoryStats.last_sync).toLocaleString()
                  : 'Never'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Aviation Inventory
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  <RocketLaunchIcon className="h-4 w-4 mr-1" />
                  Total Parts
                </div>
              </dt>
              <dd className="text-sm text-gray-900">
                {aviationStats?.totalParts || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  <CubeIcon className="h-4 w-4 mr-1" />
                  Inventory Items
                </div>
              </dt>
              <dd className="text-sm text-gray-900">
                {aviationStats?.totalInventoryItems || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  Pending POs
                </div>
              </dt>
              <dd className="text-sm text-gray-900">
                {aviationStats?.pendingPurchaseOrders || 0}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-500">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-yellow-500" />
                  Low Stock Items
                </div>
              </dt>
              <dd className="text-sm font-medium text-yellow-600">
                {aviationStats?.lowStockItems || 0}
              </dd>
            </div>
          </dl>
          <Link
            to="/aviation"
            className="mt-4 block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Aviation Inventory
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;