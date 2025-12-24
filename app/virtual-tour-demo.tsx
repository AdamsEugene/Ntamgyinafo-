import React, { useState } from "react";
import { View, StyleSheet, Modal } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  PanoramaViewer,
  VirtualTourCreator,
  Scene,
} from "@/components/VirtualTour";

// Demo scenes with sample 360° images
const DEMO_SCENES: Scene[] = [
  {
    id: "living-room",
    name: "Living Room",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000",
    thumbnail:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=200",
    hotspots: [
      {
        id: "h1",
        type: "navigation",
        x: 0.8,
        y: 0.5,
        label: "Kitchen",
        icon: "arrow-forward-circle",
        targetSceneId: "kitchen",
      },
      {
        id: "h2",
        type: "info",
        x: 0.3,
        y: 0.4,
        label: "Smart TV",
        icon: "tv",
        infoText:
          "65-inch Smart TV with built-in streaming services. Wall-mounted with hidden cable management.",
      },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=2000",
    thumbnail:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200",
    hotspots: [
      {
        id: "h3",
        type: "navigation",
        x: 0.2,
        y: 0.5,
        label: "Living Room",
        icon: "arrow-forward-circle",
        targetSceneId: "living-room",
      },
      {
        id: "h4",
        type: "navigation",
        x: 0.9,
        y: 0.5,
        label: "Bedroom",
        icon: "arrow-forward-circle",
        targetSceneId: "bedroom",
      },
      {
        id: "h5",
        type: "info",
        x: 0.5,
        y: 0.3,
        label: "Appliances",
        icon: "restaurant",
        infoText:
          "Modern kitchen with stainless steel appliances including refrigerator, dishwasher, and gas range.",
      },
    ],
  },
  {
    id: "bedroom",
    name: "Master Bedroom",
    imageUrl:
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=2000",
    thumbnail:
      "https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=200",
    hotspots: [
      {
        id: "h6",
        type: "navigation",
        x: 0.1,
        y: 0.5,
        label: "Kitchen",
        icon: "arrow-forward-circle",
        targetSceneId: "kitchen",
      },
      {
        id: "h7",
        type: "info",
        x: 0.5,
        y: 0.6,
        label: "King Size Bed",
        icon: "bed",
        infoText:
          "Spacious master bedroom with king-size bed and premium memory foam mattress.",
      },
    ],
  },
];

export default function VirtualTourDemoScreen() {
  const router = useRouter();
  const [showViewer, setShowViewer] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [scenes, setScenes] = useState<Scene[]>(DEMO_SCENES);

  const handleClose = () => {
    router.back();
  };

  const handleTourCreated = (newScenes: Scene[]) => {
    setScenes(newScenes);
    setShowCreator(false);
    setShowViewer(true);
  };

  const handleCreatorCancel = () => {
    setShowCreator(false);
    setShowViewer(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Panorama Viewer */}
      {showViewer && (
        <PanoramaViewer
          scenes={scenes}
          onClose={handleClose}
          showControls
          showThumbnails
          autoRotate={false}
        />
      )}

      {/* Tour Creator Modal */}
      <Modal visible={showCreator} animationType="slide">
        <VirtualTourCreator
          existingScenes={scenes}
          onComplete={handleTourCreated}
          onCancel={handleCreatorCancel}
          maxScenes={10}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
