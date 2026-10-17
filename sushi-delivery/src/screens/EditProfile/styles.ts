import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202020',
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  headerRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 44,
  },

  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,

    alignSelf: 'center',

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    marginTop: 18,
    marginBottom: 28,
  },

  input: {
    height: 72,
    borderRadius: 20,

    paddingHorizontal: 20,

    backgroundColor: '#333333',
    color: '#FFFFFF',

    fontSize: 18,

    marginBottom: 18,
  },

  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },

  genderButton: {
    flex: 1,

    minHeight: 92,
    borderRadius: 20,

    paddingHorizontal: 16,
    paddingVertical: 14,

    justifyContent: 'center',

    backgroundColor: '#333333',

    borderWidth: 2,
    borderColor: 'transparent',
  },

  genderButtonActive: {
    borderColor: '#FFFFFF',
  },

  genderTitle: {
    color: '#8C8C8C',
    fontSize: 14,
  },

  genderText: {
    color: '#FFFFFF',
    fontSize: 18,

    marginTop: 4,
  },

  dateInput: {
    minHeight: 72,
    borderRadius: 20,

    paddingHorizontal: 20,
    paddingVertical: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    backgroundColor: '#333333',

    marginBottom: 18,
  },

  dateLabel: {
    color: '#8C8C8C',
    fontSize: 13,
    marginBottom: 4,
  },

  dateText: {
    color: '#FFFFFF',
    fontSize: 18,
  },

  datePlaceholder: {
    color: '#888888',
  },

  error: {
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 12,
  },

  saveButton: {
    height: 64,
    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#000000',

    marginTop: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#FFFFFF',

    fontSize: 20,
    fontWeight: '600',
  },
});