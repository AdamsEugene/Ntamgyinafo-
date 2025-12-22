import { Tabs } from "expo-router";
import React from "react";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";

const OWNER_TABS: TabItem[] = [
  {
    id: "index",
    label: "Dashboard",
    icon: "stats-chart-outline",
    activeIcon: "stats-chart",
  },
  {
    id: "my-listings",
    label: "Listings",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "messages",
    label: "Messages",
    icon: "chatbubbles-outline",
    activeIcon: "chatbubbles",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person-outline",
    activeIcon: "person",
  },
];

export default function OwnerTabLayout() {
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
        // Map add-listing, pending-approval, and listing to my-listings for bottom nav highlighting
        const activeTab =
          currentRouteName === "add-listing" ||
          currentRouteName === "pending-approval" ||
          currentRouteName === "listing"
            ? "my-listings"
            : currentRouteName;
        return (
          <BottomNavigation
            tabs={OWNER_TABS}
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
        name="my-listings"
        options={{
          title: "My Listings",
        }}
      />
      <Tabs.Screen
        name="add-listing"
        options={{
          title: "Add Listing",
        }}
      />
      <Tabs.Screen
        name="pending-approval"
        options={{
          title: "Pending Approval",
        }}
      />
      <Tabs.Screen
        name="listing"
        options={{
          title: "Listing Detail",
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
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
