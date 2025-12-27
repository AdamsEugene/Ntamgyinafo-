import { Tabs } from "expo-router";
import React from "react";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";

const ADMIN_TABS: TabItem[] = [
  {
    id: "index",
    label: "Dashboard",
    icon: "grid-outline",
    activeIcon: "grid",
  },
  {
    id: "users",
    label: "Users",
    icon: "people-outline",
    activeIcon: "people",
  },
  {
    id: "properties",
    label: "Properties",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "bar-chart-outline",
    activeIcon: "bar-chart",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

// Map certain screens to their parent tab for bottom nav highlighting
const getActiveTabForRoute = (routeName: string): string => {
  switch (routeName) {
    case "transactions":
      return "reports"; // Transactions is under Reports tab
    default:
      return routeName;
  }
};

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // Hide default tab bar
        },
      }}
      tabBar={(props) => {
        const currentRouteName = props.state.routes[props.state.index].name;
        const activeTab = getActiveTabForRoute(currentRouteName);
        return (
          <BottomNavigation
            tabs={ADMIN_TABS}
            activeTab={activeTab}
            onTabPress={(tabId) => {
              const route = props.state.routes.find((r) => r.name === tabId);
              if (route) {
                props.navigation.navigate(route.name as never);
              }
            }}
          />
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
        }}
      />
      <Tabs.Screen
        name="properties"
        options={{
          title: "Properties",
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="reports-support"
        options={{
          title: "Reports & Support",
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="system-logs"
        options={{
          title: "System Logs",
          href: null, // Hidden from tab bar, accessible via navigation
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
