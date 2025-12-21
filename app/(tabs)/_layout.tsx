import { Tabs } from "expo-router";
import React from "react";
import { BottomNavigation, type TabItem } from "@/components/BottomNavigation";

const TABS: TabItem[] = [
  {
    id: "index",
    label: "Home",
    icon: "home-outline",
    activeIcon: "home",
  },
  {
    id: "search",
    label: "Search",
    icon: "search-outline",
    activeIcon: "search",
  },
  {
    id: "map",
    label: "Map",
    icon: "map-outline",
    activeIcon: "map",
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

export default function TabLayout() {
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
            tabs={TABS}
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
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
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
