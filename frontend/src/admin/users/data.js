// Mock data for user management
// src/hooks/data.js
export const userManagementData = {
  usersList: [
    {
      id: "user1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "admin",
      status: "active",
      lastActive: new Date().toISOString(),
      isDeactivated: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 120)).toISOString()
    },
    {
      id: "user2",
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: "user",
      status: "active",
      lastActive: new Date().toISOString(),
      isDeactivated: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 60)).toISOString()
    },
    {
      id: "user3",
      name: "Robert Johnson",
      email: "robert.johnson@example.com",
      role: "user",
      status: "unverified",
      lastActive: null,
      isDeactivated: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString()
    },
    {
      id: "user4",
      name: "Emily Brown",
      email: "emily.brown@example.com",
      role: "user",
      status: "active",
      lastActive: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      isDeactivated: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString()
    },
    {
      id: "user5",
      name: "Michael Wilson",
      email: "michael.wilson@example.com",
      role: "admin",
      status: "inactive",
      lastActive: new Date(new Date().setDate(new Date().getDate() - 32)).toISOString(),
      isDeactivated: false,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 150)).toISOString()
    }
  ],
  deletedUsers: [
    {
      id: "user6",
      name: "Sarah Miller",
      email: "sarah.miller@example.com",
      role: "user",
      status: "deactivated",
      lastActive: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
      isDeactivated: true,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 180)).toISOString(),
      deactivatedAt: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString()
    },
    {
      id: "user7",
      name: "David Taylor",
      email: "david.taylor@example.com",
      role: "user",
      status: "deactivated",
      lastActive: new Date(new Date().setDate(new Date().getDate() - 120)).toISOString(),
      isDeactivated: true,
      createdAt: new Date(new Date().setDate(new Date().getDate() - 200)).toISOString(),
      deactivatedAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString()
    }
  ],
  statistics: {
    totalUsers: "5",
    activeUsers: "3",
    newUsers: "1",
    verifiedUsers: "4",
    deletedUsers: "2"
  },
  activityData: [
    { date: "Mar 13", totalVisits: 7, activeUsers: 4, newUsers: 2 },
    { date: "Mar 14", totalVisits: 5, activeUsers: 3, newUsers: 1 },
    { date: "Mar 15", totalVisits: 6, activeUsers: 4, newUsers: 0 },
    { date: "Mar 16", totalVisits: 6, activeUsers: 3, newUsers: 2 },
    { date: "Mar 17", totalVisits: 8, activeUsers: 4, newUsers: 1 },
    { date: "Mar 18", totalVisits: 10, activeUsers: 4, newUsers: 3 },
    { date: "Mar 19", totalVisits: 4, activeUsers: 3, newUsers: 0 }
  ]
};