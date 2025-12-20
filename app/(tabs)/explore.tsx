import { YStack, XStack, Text, Card, H3, Paragraph, Separator, ScrollView, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export default function ExploreScreen() {
  return (
    <ScrollView backgroundColor="$background">
      <YStack padding="$4" space="$4">
        <XStack alignItems="center" space="$3">
          <Ionicons name="compass" size={32} color="#007AFF" />
          <H3 fontSize="$8" fontWeight="bold">
            Explore Tamagui
          </H3>
        </XStack>

        <Card elevate size="$4" bordered>
          <Card.Header padded>
            <XStack alignItems="center" space="$2">
              <Ionicons name="layers" size={24} color="#007AFF" />
              <Text fontSize="$6" fontWeight="600">
                UI Components
              </Text>
            </XStack>
          </Card.Header>
          <Card.Footer padded>
            <YStack space="$3" width="100%">
              <Paragraph>
                Tamagui provides a comprehensive set of beautiful, performant UI components.
              </Paragraph>
              <Separator />
              <XStack space="$2" flexWrap="wrap">
                <Button size="$3" theme="blue" icon={<Ionicons name="cube" size={16} />}>
                  Cards
                </Button>
                <Button size="$3" theme="green" icon={<Ionicons name="list" size={16} />}>
                  Lists
                </Button>
                <Button size="$3" theme="orange" icon={<Ionicons name="grid" size={16} />}>
                  Grids
                </Button>
              </XStack>
            </YStack>
          </Card.Footer>
        </Card>

        <Card elevate size="$3" bordered backgroundColor="$green2">
          <Card.Header padded>
            <XStack alignItems="center" space="$2">
              <Ionicons name="color-palette" size={24} color="#34C759" />
              <Text fontSize="$6" fontWeight="600" color="$green11">
                Theming
              </Text>
            </XStack>
          </Card.Header>
          <Card.Footer padded>
            <Paragraph>
              Built-in support for light and dark themes with easy customization.
            </Paragraph>
          </Card.Footer>
        </Card>

        <Card elevate size="$3" bordered backgroundColor="$purple2">
          <Card.Header padded>
            <XStack alignItems="center" space="$2">
              <Ionicons name="flash" size={24} color="#AF52DE" />
              <Text fontSize="$6" fontWeight="600" color="$purple11">
                Performance
              </Text>
            </XStack>
          </Card.Header>
          <Card.Footer padded>
            <Paragraph>
              Optimized for performance with compile-time optimizations and minimal runtime overhead.
            </Paragraph>
          </Card.Footer>
        </Card>

        <YStack space="$3" paddingTop="$2">
          <Text fontSize="$6" fontWeight="bold">
            Icon Library
          </Text>
          <Separator />
          <XStack space="$4" flexWrap="wrap" justifyContent="center">
            <YStack alignItems="center" space="$2" padding="$3">
              <Ionicons name="heart" size={40} color="#FF3B30" />
              <Text fontSize="$3">Ionicons</Text>
            </YStack>
            <YStack alignItems="center" space="$2" padding="$3">
              <Ionicons name="star" size={40} color="#FF9500" />
              <Text fontSize="$3">Beautiful</Text>
            </YStack>
            <YStack alignItems="center" space="$2" padding="$3">
              <Ionicons name="rocket" size={40} color="#007AFF" />
              <Text fontSize="$3">Fast</Text>
            </YStack>
            <YStack alignItems="center" space="$2" padding="$3">
              <Ionicons name="sparkles" size={40} color="#AF52DE" />
              <Text fontSize="$3">Modern</Text>
            </YStack>
          </XStack>
        </YStack>

        <Card elevate size="$3" bordered>
          <Card.Header padded>
            <XStack alignItems="center" space="$2">
              <Ionicons name="code" size={24} color="#007AFF" />
              <Text fontSize="$6" fontWeight="600">
                TypeScript Support
              </Text>
            </XStack>
          </Card.Header>
          <Card.Footer padded>
            <Paragraph>
              Full TypeScript support with excellent type safety and IntelliSense.
            </Paragraph>
          </Card.Footer>
        </Card>
      </YStack>
    </ScrollView>
  );
}
