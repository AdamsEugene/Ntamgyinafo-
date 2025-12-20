import { YStack, XStack, Button, Text, Card, H2, Paragraph, Separator } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <YStack flex={1} backgroundColor="$background" padding="$4" space="$4">
      <Card elevate size="$4" bordered>
        <Card.Header padded>
          <XStack alignItems="center" space="$3">
            <Ionicons name="rocket" size={32} color="#007AFF" />
            <H2>Welcome to Tamagui!</H2>
          </XStack>
        </Card.Header>
        <Card.Footer padded>
          <Paragraph>
            Beautiful, performant UI components built with Tamagui and Expo.
          </Paragraph>
        </Card.Footer>
      </Card>

      <YStack space="$3">
        <Text fontSize="$6" fontWeight="bold" color="$color">
          Quick Actions
        </Text>
        <Separator />
        
        <XStack space="$3" flexWrap="wrap">
          <Button
            icon={<Ionicons name="star" size={20} color="white" />}
            theme="active"
            size="$4"
            flex={1}
            minWidth={120}
          >
            <Text color="white" fontWeight="600">Favorite</Text>
          </Button>
          
          <Button
            icon={<Ionicons name="share-social" size={20} color="white" />}
            theme="blue"
            size="$4"
            flex={1}
            minWidth={120}
          >
            <Text color="white" fontWeight="600">Share</Text>
          </Button>
        </XStack>

        <XStack space="$3" flexWrap="wrap">
          <Button
            icon={<Ionicons name="settings" size={20} color="white" />}
            theme="green"
            size="$4"
            flex={1}
            minWidth={120}
          >
            <Text color="white" fontWeight="600">Settings</Text>
          </Button>
          
          <Button
            icon={<Ionicons name="notifications" size={20} color="white" />}
            theme="orange"
            size="$4"
            flex={1}
            minWidth={120}
          >
            <Text color="white" fontWeight="600">Notifications</Text>
          </Button>
        </XStack>
      </YStack>

      <Card elevate size="$3" bordered backgroundColor="$blue2">
        <Card.Header padded>
          <XStack alignItems="center" space="$2">
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text fontSize="$5" fontWeight="600" color="$blue11">
              Getting Started
            </Text>
          </XStack>
        </Card.Header>
        <Card.Footer padded>
          <YStack space="$2">
            <XStack alignItems="center" space="$2">
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text>Tamagui is installed and configured</Text>
            </XStack>
            <XStack alignItems="center" space="$2">
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text>Icons from @expo/vector-icons are ready</Text>
            </XStack>
            <XStack alignItems="center" space="$2">
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text>Start building your amazing app!</Text>
            </XStack>
          </YStack>
        </Card.Footer>
      </Card>
    </YStack>
  );
}
