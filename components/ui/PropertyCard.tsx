import { Card, XStack, YStack, Text, Image } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius } from '@/constants/design';

interface PropertyCardProps {
  image: string;
  title: string;
  location: string;
  price: string;
  bedrooms?: number;
  bathrooms?: number;
  saved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  variant?: 'list' | 'grid';
}

export function PropertyCard({
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  saved = false,
  onPress,
  onSave,
  variant = 'list',
}: PropertyCardProps) {
  if (variant === 'grid') {
    return (
      <Card
        elevate
        bordered
        borderRadius={BorderRadius.large}
        width="48%"
        onPress={onPress}
        pressStyle={{ opacity: 0.8 }}
        backgroundColor={Colors.surface}
        {...Shadows.elevation1}
      >
        <YStack>
          <Image
            source={{ uri: image }}
            width="100%"
            aspectRatio={4 / 5}
            borderTopLeftRadius={BorderRadius.large}
            borderTopRightRadius={BorderRadius.large}
          />
          <YStack padding={12} space="$2">
            <Text
              fontSize={16}
              fontWeight="500"
              numberOfLines={2}
              color={Colors.textPrimary}
            >
              {title}
            </Text>
            <XStack alignItems="center" space="$1">
              <Ionicons name="location" size={12} color={Colors.textSecondary} />
              <Text fontSize={12} color={Colors.textSecondary} numberOfLines={1}>
                {location}
              </Text>
            </XStack>
            <Text fontSize={20} fontWeight="600" color={Colors.primaryGreen}>
              {price}
            </Text>
            {(bedrooms || bathrooms) && (
              <XStack space="$2">
                {bedrooms && (
                  <XStack alignItems="center" space="$1">
                    <Ionicons name="bed" size={14} color={Colors.textSecondary} />
                    <Text fontSize={12} color={Colors.textSecondary}>
                      {bedrooms}
                    </Text>
                  </XStack>
                )}
                {bathrooms && (
                  <XStack alignItems="center" space="$1">
                    <Ionicons name="water" size={14} color={Colors.textSecondary} />
                    <Text fontSize={12} color={Colors.textSecondary}>
                      {bathrooms}
                    </Text>
                  </XStack>
                )}
              </XStack>
            )}
          </YStack>
          {onSave && (
            <XStack
              position="absolute"
              top={8}
              right={8}
              onPress={onSave}
              padding={8}
              backgroundColor="rgba(0,0,0,0.3)"
              borderRadius={BorderRadius.full}
            >
              <Ionicons
                name={saved ? 'heart' : 'heart-outline'}
                size={20}
                color={saved ? Colors.error : '#FFFFFF'}
              />
            </XStack>
          )}
        </YStack>
      </Card>
    );
  }

  // List variant
  return (
    <Card
      elevate
      bordered
      borderRadius={BorderRadius.large}
      marginBottom={16}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      backgroundColor={Colors.surface}
      {...Shadows.elevation1}
    >
      <XStack padding={16} space="$3">
        <Image
          source={{ uri: image }}
          width={120}
          height={120}
          borderRadius={BorderRadius.medium}
        />
        <YStack flex={1} justifyContent="space-between">
          <YStack space="$1">
            <Text
              fontSize={16}
              fontWeight="500"
              numberOfLines={1}
              color={Colors.textPrimary}
            >
              {title}
            </Text>
            <XStack alignItems="center" space="$1">
              <Ionicons name="location" size={14} color={Colors.textSecondary} />
              <Text fontSize={14} color={Colors.textSecondary} numberOfLines={1}>
                {location}
              </Text>
            </XStack>
            <Text fontSize={20} fontWeight="600" color={Colors.primaryGreen}>
              {price}
            </Text>
            {(bedrooms || bathrooms) && (
              <XStack space="$3">
                {bedrooms && (
                  <XStack alignItems="center" space="$1">
                    <Ionicons name="bed" size={14} color={Colors.textSecondary} />
                    <Text fontSize={12} color={Colors.textSecondary}>
                      {bedrooms} Bed
                    </Text>
                  </XStack>
                )}
                {bathrooms && (
                  <XStack alignItems="center" space="$1">
                    <Ionicons name="water" size={14} color={Colors.textSecondary} />
                    <Text fontSize={12} color={Colors.textSecondary}>
                      {bathrooms} Bath
                    </Text>
                  </XStack>
                )}
              </XStack>
            )}
          </YStack>
        </YStack>
        {onSave && (
          <XStack onPress={onSave} padding={8}>
            <Ionicons
              name={saved ? 'heart' : 'heart-outline'}
              size={24}
              color={saved ? Colors.error : Colors.textSecondary}
            />
          </XStack>
        )}
      </XStack>
    </Card>
  );
}

