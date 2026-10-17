import {
  Pressable,
  Text,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';

type HeaderProps = {
  onMenuPress: () => void;
  onSearchPress: () => void;
};

export const Header = ({
  onMenuPress,
  onSearchPress,
}: HeaderProps) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onMenuPress}
        style={styles.iconButton}
        hitSlop={10}
      >
        <Ionicons
          name="menu-outline"
          size={34}
          color="#111"
        />
      </Pressable>

      <Text style={styles.logo}>
        NORI
      </Text>

      <Pressable
        onPress={onSearchPress}
        style={styles.iconButton}
        hitSlop={10}
      >
        <Ionicons
          name="search-outline"
          size={28}
          color="#111"
        />
      </Pressable>
    </View>
  );
};