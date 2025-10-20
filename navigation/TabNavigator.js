import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FeedScreen from '../screens/FeedScreen';
import ExploreScreen from '../screens/ExploreScreen';
import MapScreen from '../screens/MapScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { StyleSheet, Animated, View } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { rs } from '../utils/responsive';

const Tab = createBottomTabNavigator();

const iconMap = {
  Feed: 'home',
  Explore: 'magnify',
  Map: 'map',
  Favorites: 'heart',
  Profile: 'account-circle',
};

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          paddingBottom: insets.bottom,
          height: 56 + insets.bottom,
          borderTopWidth: 0.5,
          borderTopColor: '#eee'
        },
        tabBarIcon: ({ focused }) => {
          const iconName = iconMap[route.name];
          return (
            <View style={[styles.iconPill, focused && styles.iconPillFocused]}>
              <Icon
                name={iconName}
                size={rs(23)}
                color={focused ? '#FFFFFF' : '#757575'}
              />
            </View>
          );
        },
        tabBarShowLabel: false,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconPill: {
    padding: 8,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
    minHeight: 50,
  },
  iconPillFocused: {
    backgroundColor: '#2EBFA5',
  },
});

