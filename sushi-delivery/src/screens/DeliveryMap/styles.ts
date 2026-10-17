import { StyleSheet } from 'react-native';

export const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#111111',
    },

    map: {
      ...StyleSheet.absoluteFill,
    },

    centerMarker: {
      position: 'absolute',

      left: '50%',
      top: '29%',

      alignItems: 'center',

      transform: [
        {
          translateX: -18,
        },
      ],
    },

    markerCircle: {
      width: 36,
      height: 36,

      borderRadius: 18,

      borderWidth: 5,
      borderColor: '#000000',

      backgroundColor: '#FFFFFF',
    },

    markerLine: {
      width: 4,
      height: 28,

      backgroundColor: '#000000',
    },

    mapControls: {
      position: 'absolute',

      right: 18,
      top: '43%',
    },

    locationButton: {
      width: 52,
      height: 52,

      borderRadius: 15,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        'rgba(255,255,255,0.94)',
    },

    sheet: {
      position: 'absolute',

      left: 0,
      right: 0,
      bottom: 0,

      paddingHorizontal: 16,
      paddingTop: 7,
      paddingBottom: 24,

      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,

      backgroundColor:
        'rgba(53,60,58,0.90)',
    },

    handle: {
      width: 48,
      height: 4,

      alignSelf: 'center',

      borderRadius: 2,

      marginBottom: 8,

      backgroundColor:
        'rgba(255,255,255,0.30)',
    },

    toggle: {
      height: 54,

      flexDirection: 'row',

      padding: 4,

      borderRadius: 18,

      backgroundColor:
        'rgba(55,62,60,0.86)',
    },

    toggleButton: {
      flex: 1,

      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: 15,
    },

    toggleButtonActive: {
      backgroundColor: '#000000',
    },

    toggleText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },

    toggleTextActive: {
      fontWeight: '800',
    },

    pickupMarker: {
      width: 40,
      height: 40,

      borderRadius: 20,

      alignItems: 'center',
      justifyContent: 'center',

      borderWidth: 3,
      borderColor: '#FFFFFF',

      backgroundColor: '#111111',
    },

    pickupMarkerActive: {
      width: 46,
      height: 46,

      borderRadius: 23,

      backgroundColor: '#27BE6B',
    },


    continueButton: {
      height: 54,

      marginTop: 9,

      borderRadius: 17,

      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor: '#000000',
    },

    continueText: {
      color: '#FFFFFF',

      fontSize: 18,
      fontWeight: '800',
    },
  });