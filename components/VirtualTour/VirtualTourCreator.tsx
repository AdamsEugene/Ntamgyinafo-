import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors, Typography, Spacing } from "@/constants/design";
import { Scene, Hotspot } from "./PanoramaViewer";

export interface VirtualTourCreatorProps {
  onComplete: (scenes: Scene[]) => void;
  onCancel: () => void;
  existingScenes?: Scene[];
  maxScenes?: number;
}

type EditingHotspot = {
  sceneId: string;
  hotspot: Partial<Hotspot>;
  isNew: boolean;
};

export function VirtualTourCreator({
  onComplete,
  onCancel,
  existingScenes = [],
  maxScenes = 10,
}: VirtualTourCreatorProps) {
  const insets = useSafeAreaInsets();
  const [scenes, setScenes] = useState<Scene[]>(existingScenes);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    existingScenes[0]?.id || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [editingScene, setEditingScene] = useState<string | null>(null);
  const [editingHotspot, setEditingHotspot] = useState<EditingHotspot | null>(
    null
  );

  const selectedScene = scenes.find((s) => s.id === selectedSceneId);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Add new 360° photo
  const handleAddPhoto = useCallback(async () => {
    if (scenes.length >= maxScenes) {
      Alert.alert(
        "Maximum Reached",
        `You can only add up to ${maxScenes} scenes.`
      );
      return;
    }

    Alert.alert("Add 360° Photo", "Choose how to add your panoramic photo", [
      {
        text: "Camera",
        onPress: () => pickImage(true),
      },
      {
        text: "Gallery",
        onPress: () => pickImage(false),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [scenes.length, maxScenes]);

  const pickImage = async (useCamera: boolean) => {
    try {
      setIsLoading(true);

      // Request permissions
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Camera permission is needed to take photos."
          );
          setIsLoading(false);
          return;
        }
      } else {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permission Required",
            "Photo library permission is needed to select photos."
          );
          setIsLoading(false);
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: [2, 1], // Panoramic aspect ratio
      });

      if (!result.canceled && result.assets[0]) {
        const newScene: Scene = {
          id: generateId(),
          name: `Room ${scenes.length + 1}`,
          imageUrl: result.assets[0].uri,
          thumbnail: result.assets[0].uri,
          hotspots: [],
        };

        setScenes((prev) => [...prev, newScene]);
        setSelectedSceneId(newScene.id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete scene
  const handleDeleteScene = useCallback(
    (sceneId: string) => {
      Alert.alert(
        "Delete Scene",
        "Are you sure you want to delete this scene?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setScenes((prev) => {
                const filtered = prev.filter((s) => s.id !== sceneId);
                // Update selected scene if needed
                if (selectedSceneId === sceneId) {
                  setSelectedSceneId(filtered[0]?.id || null);
                }
                // Remove hotspots pointing to deleted scene
                return filtered.map((scene) => ({
                  ...scene,
                  hotspots: scene.hotspots.filter(
                    (h) => h.targetSceneId !== sceneId
                  ),
                }));
              });
            },
          },
        ]
      );
    },
    [selectedSceneId]
  );

  // Rename scene
  const handleRenameScene = useCallback((sceneId: string, newName: string) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === sceneId ? { ...s, name: newName } : s))
    );
    setEditingScene(null);
  }, []);

  // Add hotspot to scene
  const handleAddHotspot = useCallback(
    (type: "navigation" | "info") => {
      if (!selectedSceneId) return;

      const newHotspot: Partial<Hotspot> = {
        id: generateId(),
        type,
        x: 0.5, // Center of image
        y: 0.5,
        label: type === "navigation" ? "Go to..." : "Info point",
      };

      setEditingHotspot({
        sceneId: selectedSceneId,
        hotspot: newHotspot,
        isNew: true,
      });
    },
    [selectedSceneId]
  );

  // Save hotspot
  const handleSaveHotspot = useCallback(
    (hotspot: Hotspot) => {
      if (!editingHotspot) return;

      setScenes((prev) =>
        prev.map((scene) => {
          if (scene.id !== editingHotspot.sceneId) return scene;

          if (editingHotspot.isNew) {
            return {
              ...scene,
              hotspots: [...scene.hotspots, hotspot],
            };
          } else {
            return {
              ...scene,
              hotspots: scene.hotspots.map((h) =>
                h.id === hotspot.id ? hotspot : h
              ),
            };
          }
        })
      );
      setEditingHotspot(null);
    },
    [editingHotspot]
  );

  // Delete hotspot
  const handleDeleteHotspot = useCallback(
    (sceneId: string, hotspotId: string) => {
      Alert.alert(
        "Delete Hotspot",
        "Are you sure you want to delete this hotspot?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              setScenes((prev) =>
                prev.map((scene) => {
                  if (scene.id !== sceneId) return scene;
                  return {
                    ...scene,
                    hotspots: scene.hotspots.filter((h) => h.id !== hotspotId),
                  };
                })
              );
            },
          },
        ]
      );
    },
    []
  );

  // Complete and save tour
  const handleComplete = useCallback(() => {
    if (scenes.length === 0) {
      Alert.alert("No Scenes", "Please add at least one 360° photo.");
      return;
    }
    onComplete(scenes);
  }, [scenes, onComplete]);

  // Render scene thumbnail
  const renderSceneThumbnail = ({ item }: { item: Scene }) => (
    <TouchableOpacity
      style={[
        styles.sceneThumbnail,
        selectedSceneId === item.id && styles.sceneThumbnailActive,
      ]}
      onPress={() => setSelectedSceneId(item.id)}
      onLongPress={() => setEditingScene(item.id)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.thumbnail || item.imageUrl }}
        style={styles.sceneThumbnailImage}
      />
      <View style={styles.sceneThumbnailOverlay}>
        <Text style={styles.sceneThumbnailText} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.sceneThumbnailBadges}>
          {item.hotspots.length > 0 && (
            <View style={styles.hotspotCountBadge}>
              <Ionicons name="location" size={10} color="#FFFFFF" />
              <Text style={styles.hotspotCountText}>{item.hotspots.length}</Text>
            </View>
          )}
        </View>
      </View>
      {selectedSceneId === item.id && (
        <View style={styles.sceneThumbnailCheck}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.primaryGreen} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onCancel}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Virtual Tour</Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            styles.headerButtonPrimary,
            scenes.length === 0 && styles.headerButtonDisabled,
          ]}
          onPress={handleComplete}
          disabled={scenes.length === 0}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.headerButtonText,
              scenes.length === 0 && styles.headerButtonTextDisabled,
            ]}
          >
            Done
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scene Count */}
      <View style={styles.sceneCountBar}>
        <Ionicons name="images" size={18} color={Colors.primaryGreen} />
        <Text style={styles.sceneCountText}>
          {scenes.length}/{maxScenes} scenes
        </Text>
      </View>

      {/* Scene Thumbnails */}
      <View style={styles.scenesContainer}>
        <FlatList
          data={scenes}
          renderItem={renderSceneThumbnail}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scenesList}
          ListFooterComponent={
            scenes.length < maxScenes ? (
              <TouchableOpacity
                style={styles.addSceneButton}
                onPress={handleAddPhoto}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.primaryGreen} />
                ) : (
                  <>
                    <Ionicons name="add" size={28} color={Colors.primaryGreen} />
                    <Text style={styles.addSceneText}>Add 360°</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedScene ? (
          <>
            {/* Preview */}
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: selectedScene.imageUrl }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <View style={styles.previewOverlay}>
                <Text style={styles.previewHint}>
                  This is how your 360° photo will look
                </Text>
              </View>

              {/* Hotspots on preview */}
              {selectedScene.hotspots.map((hotspot) => (
                <TouchableOpacity
                  key={hotspot.id}
                  style={[
                    styles.previewHotspot,
                    {
                      left: `${hotspot.x * 100}%`,
                      top: `${hotspot.y * 100}%`,
                    },
                  ]}
                  onPress={() =>
                    setEditingHotspot({
                      sceneId: selectedScene.id,
                      hotspot,
                      isNew: false,
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.previewHotspotInner,
                      hotspot.type === "navigation"
                        ? styles.hotspotNavigation
                        : styles.hotspotInfo,
                    ]}
                  >
                    <Ionicons
                      name={
                        hotspot.type === "navigation"
                          ? "arrow-forward"
                          : "information"
                      }
                      size={14}
                      color="#FFFFFF"
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Scene Settings */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Scene Settings</Text>

              {/* Scene Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Scene Name</Text>
                <TextInput
                  style={styles.input}
                  value={selectedScene.name}
                  onChangeText={(text) =>
                    handleRenameScene(selectedScene.id, text)
                  }
                  placeholder="e.g., Living Room"
                  placeholderTextColor={Colors.textSecondary}
                />
              </View>

              {/* Delete Scene */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteScene(selectedScene.id)}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete This Scene</Text>
              </TouchableOpacity>
            </View>

            {/* Hotspots */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hotspots</Text>
                <Text style={styles.sectionSubtitle}>
                  {selectedScene.hotspots.length} hotspots
                </Text>
              </View>

              <Text style={styles.sectionDescription}>
                Add interactive points that link to other scenes or show
                information.
              </Text>

              {/* Add Hotspot Buttons */}
              <View style={styles.hotspotButtonsRow}>
                <TouchableOpacity
                  style={styles.addHotspotButton}
                  onPress={() => handleAddHotspot("navigation")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.hotspotIcon, styles.hotspotNavigation]}>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.hotspotButtonContent}>
                    <Text style={styles.hotspotButtonTitle}>Navigation</Text>
                    <Text style={styles.hotspotButtonDesc}>
                      Link to another scene
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addHotspotButton}
                  onPress={() => handleAddHotspot("info")}
                  activeOpacity={0.8}
                >
                  <View style={[styles.hotspotIcon, styles.hotspotInfo]}>
                    <Ionicons name="information" size={18} color="#FFFFFF" />
                  </View>
                  <View style={styles.hotspotButtonContent}>
                    <Text style={styles.hotspotButtonTitle}>Info Point</Text>
                    <Text style={styles.hotspotButtonDesc}>Show information</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Existing Hotspots List */}
              {selectedScene.hotspots.length > 0 && (
                <View style={styles.hotspotsList}>
                  {selectedScene.hotspots.map((hotspot) => (
                    <View key={hotspot.id} style={styles.hotspotItem}>
                      <View
                        style={[
                          styles.hotspotItemIcon,
                          hotspot.type === "navigation"
                            ? styles.hotspotNavigation
                            : styles.hotspotInfo,
                        ]}
                      >
                        <Ionicons
                          name={
                            hotspot.type === "navigation"
                              ? "arrow-forward"
                              : "information"
                          }
                          size={16}
                          color="#FFFFFF"
                        />
                      </View>
                      <View style={styles.hotspotItemContent}>
                        <Text style={styles.hotspotItemLabel}>
                          {hotspot.label}
                        </Text>
                        <Text style={styles.hotspotItemType}>
                          {hotspot.type === "navigation"
                            ? `Links to: ${
                                scenes.find(
                                  (s) => s.id === hotspot.targetSceneId
                                )?.name || "Not set"
                              }`
                            : "Info point"}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.hotspotItemEdit}
                        onPress={() =>
                          setEditingHotspot({
                            sceneId: selectedScene.id,
                            hotspot,
                            isNew: false,
                          })
                        }
                      >
                        <Ionicons
                          name="pencil"
                          size={18}
                          color={Colors.textSecondary}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.hotspotItemDelete}
                        onPress={() =>
                          handleDeleteHotspot(selectedScene.id, hotspot.id)
                        }
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cube" size={48} color={Colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Create Your Virtual Tour</Text>
            <Text style={styles.emptyDescription}>
              Add 360° panoramic photos to create an immersive virtual tour of
              your property. Viewers can look around and navigate between rooms.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleAddPhoto}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.emptyButtonText}>Add First 360° Photo</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.tipBox}>
              <Ionicons name="bulb" size={18} color="#F59E0B" />
              <Text style={styles.tipText}>
                💡 Tip: Use a 360° camera app or take wide panoramic photos for
                best results
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hotspot Editor Modal */}
      {editingHotspot && (
        <HotspotEditor
          hotspot={editingHotspot.hotspot}
          scenes={scenes.filter((s) => s.id !== editingHotspot.sceneId)}
          onSave={handleSaveHotspot}
          onCancel={() => setEditingHotspot(null)}
          onDelete={
            !editingHotspot.isNew
              ? () => {
                  handleDeleteHotspot(
                    editingHotspot.sceneId,
                    editingHotspot.hotspot.id!
                  );
                  setEditingHotspot(null);
                }
              : undefined
          }
        />
      )}
    </View>
  );
}

// Hotspot Editor Component
function HotspotEditor({
  hotspot,
  scenes,
  onSave,
  onCancel,
  onDelete,
}: {
  hotspot: Partial<Hotspot>;
  scenes: Scene[];
  onSave: (hotspot: Hotspot) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [label, setLabel] = useState(hotspot.label || "");
  const [targetSceneId, setTargetSceneId] = useState(
    hotspot.targetSceneId || ""
  );
  const [infoText, setInfoText] = useState(hotspot.infoText || "");
  const [position, setPosition] = useState({
    x: hotspot.x || 0.5,
    y: hotspot.y || 0.5,
  });

  const handleSave = () => {
    if (!label.trim()) {
      Alert.alert("Error", "Please enter a label for this hotspot.");
      return;
    }

    if (hotspot.type === "navigation" && !targetSceneId) {
      Alert.alert("Error", "Please select a target scene.");
      return;
    }

    onSave({
      id: hotspot.id || `${Date.now()}`,
      type: hotspot.type || "navigation",
      x: position.x,
      y: position.y,
      label,
      targetSceneId: hotspot.type === "navigation" ? targetSceneId : undefined,
      infoText: hotspot.type === "info" ? infoText : undefined,
    });
  };

  return (
    <View style={editorStyles.overlay}>
      <View
        style={[editorStyles.container, { paddingBottom: insets.bottom + 20 }]}
      >
        <View style={editorStyles.header}>
          <Text style={editorStyles.title}>
            {hotspot.type === "navigation" ? "Navigation Point" : "Info Point"}
          </Text>
          <TouchableOpacity onPress={onCancel}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={editorStyles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Label */}
          <View style={editorStyles.inputGroup}>
            <Text style={editorStyles.inputLabel}>Label</Text>
            <TextInput
              style={editorStyles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g., Go to Kitchen"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          {/* Target Scene (for navigation) */}
          {hotspot.type === "navigation" && (
            <View style={editorStyles.inputGroup}>
              <Text style={editorStyles.inputLabel}>Link To Scene</Text>
              {scenes.length === 0 ? (
                <Text style={editorStyles.noScenesText}>
                  Add more scenes to create navigation links
                </Text>
              ) : (
                <View style={editorStyles.sceneOptions}>
                  {scenes.map((scene) => (
                    <TouchableOpacity
                      key={scene.id}
                      style={[
                        editorStyles.sceneOption,
                        targetSceneId === scene.id &&
                          editorStyles.sceneOptionActive,
                      ]}
                      onPress={() => setTargetSceneId(scene.id)}
                    >
                      <Image
                        source={{ uri: scene.thumbnail || scene.imageUrl }}
                        style={editorStyles.sceneOptionImage}
                      />
                      <Text
                        style={[
                          editorStyles.sceneOptionText,
                          targetSceneId === scene.id &&
                            editorStyles.sceneOptionTextActive,
                        ]}
                        numberOfLines={1}
                      >
                        {scene.name}
                      </Text>
                      {targetSceneId === scene.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors.primaryGreen}
                        />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Info Text (for info points) */}
          {hotspot.type === "info" && (
            <View style={editorStyles.inputGroup}>
              <Text style={editorStyles.inputLabel}>Information Text</Text>
              <TextInput
                style={[editorStyles.input, editorStyles.textArea]}
                value={infoText}
                onChangeText={setInfoText}
                placeholder="Enter information to display..."
                placeholderTextColor={Colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Position */}
          <View style={editorStyles.inputGroup}>
            <Text style={editorStyles.inputLabel}>Position</Text>
            <Text style={editorStyles.positionHint}>
              Drag the hotspot on the preview to position it
            </Text>
            <View style={editorStyles.positionSliders}>
              <View style={editorStyles.sliderRow}>
                <Text style={editorStyles.sliderLabel}>Horizontal</Text>
                <Text style={editorStyles.sliderValue}>
                  {Math.round(position.x * 100)}%
                </Text>
              </View>
              <View style={editorStyles.sliderRow}>
                <Text style={editorStyles.sliderLabel}>Vertical</Text>
                <Text style={editorStyles.sliderValue}>
                  {Math.round(position.y * 100)}%
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={editorStyles.actions}>
          {onDelete && (
            <TouchableOpacity
              style={editorStyles.deleteButton}
              onPress={onDelete}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={editorStyles.cancelButton}
            onPress={onCancel}
          >
            <Text style={editorStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={editorStyles.saveButton} onPress={handleSave}>
            <Text style={editorStyles.saveButtonText}>Save Hotspot</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonPrimary: {
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.lg,
    width: "auto",
  },
  headerButtonDisabled: {
    backgroundColor: Colors.divider,
  },
  headerButtonText: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  headerButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  headerTitle: {
    ...Typography.titleMedium,
    fontSize: 17,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sceneCountBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: `${Colors.primaryGreen}10`,
  },
  sceneCountText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.primaryGreen,
    fontWeight: "600",
  },
  scenesContainer: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  scenesList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  sceneThumbnail: {
    width: 90,
    height: 70,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: Spacing.sm,
    borderWidth: 2,
    borderColor: "transparent",
  },
  sceneThumbnailActive: {
    borderColor: Colors.primaryGreen,
  },
  sceneThumbnailImage: {
    width: "100%",
    height: "100%",
  },
  sceneThumbnailOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 4,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sceneThumbnailText: {
    ...Typography.caption,
    fontSize: 10,
    color: "#FFFFFF",
    fontWeight: "500",
    flex: 1,
  },
  sceneThumbnailBadges: {
    flexDirection: "row",
    gap: 4,
  },
  hotspotCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hotspotCountText: {
    ...Typography.caption,
    fontSize: 9,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sceneThumbnailCheck: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  addSceneButton: {
    width: 90,
    height: 70,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  addSceneText: {
    ...Typography.caption,
    fontSize: 10,
    fontWeight: "600",
    color: Colors.primaryGreen,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    margin: Spacing.lg,
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.sm,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  previewHint: {
    ...Typography.caption,
    fontSize: 11,
    color: "#FFFFFF",
    textAlign: "center",
  },
  previewHotspot: {
    position: "absolute",
    transform: [{ translateX: -12 }, { translateY: -12 }],
  },
  previewHotspotInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  section: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionDescription: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  deleteButtonText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "500",
  },
  hotspotButtonsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addHotspotButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  hotspotIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  hotspotNavigation: {
    backgroundColor: "#3B82F6",
  },
  hotspotInfo: {
    backgroundColor: "#8B5CF6",
  },
  hotspotButtonContent: {
    flex: 1,
  },
  hotspotButtonTitle: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  hotspotButtonDesc: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  hotspotsList: {
    gap: Spacing.sm,
  },
  hotspotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  hotspotItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  hotspotItemContent: {
    flex: 1,
  },
  hotspotItemLabel: {
    ...Typography.labelMedium,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  hotspotItemType: {
    ...Typography.caption,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  hotspotItemEdit: {
    padding: Spacing.xs,
  },
  hotspotItemDelete: {
    padding: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.xl * 2,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  emptyTitle: {
    ...Typography.titleLarge,
    fontSize: 22,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyDescription: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primaryGreen,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 14,
    marginBottom: Spacing.xl,
  },
  emptyButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  tipBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    backgroundColor: "#FEF3C7",
    padding: Spacing.md,
    borderRadius: 12,
    maxWidth: 300,
  },
  tipText: {
    ...Typography.bodyMedium,
    fontSize: 12,
    color: "#92400E",
    flex: 1,
    lineHeight: 18,
  },
});

const editorStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  title: {
    ...Typography.titleMedium,
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  content: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  noScenesText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  sceneOptions: {
    gap: Spacing.sm,
  },
  sceneOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  sceneOptionActive: {
    borderColor: Colors.primaryGreen,
    backgroundColor: `${Colors.primaryGreen}08`,
  },
  sceneOptionImage: {
    width: 50,
    height: 35,
    borderRadius: 6,
  },
  sceneOptionText: {
    ...Typography.bodyMedium,
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },
  sceneOptionTextActive: {
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  positionHint: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginBottom: Spacing.sm,
  },
  positionSliders: {
    gap: Spacing.sm,
  },
  sliderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  sliderLabel: {
    ...Typography.caption,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sliderValue: {
    ...Typography.labelMedium,
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primaryGreen,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  cancelButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primaryGreen,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    ...Typography.labelMedium,
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default VirtualTourCreator;

