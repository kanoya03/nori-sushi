import { Pressable, Text } from 'react-native';

import { styles } from './styles';

type CategoryChipProps = {
  title: string;
  isActive: boolean;
  onPress: () => void;
};

export const CategoryChip = ({
  title,
  isActive,
  onPress,
}: CategoryChipProps) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isActive && styles.activeContainer,
      ]}
    >
      <Text
        style={[
          styles.text,
          isActive && styles.activeText,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
};