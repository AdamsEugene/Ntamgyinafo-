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
        return (
          <BottomNavigation
            tabs={ADMIN_TABS}
            activeTab={currentRouteName}
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
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
