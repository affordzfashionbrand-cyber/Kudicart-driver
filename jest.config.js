module.exports = {
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  moduleFileExtensions: ['web.tsx', 'tsx', 'web.ts', 'ts', 'web.jsx', 'jsx', 'web.js', 'js', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native-web)/)',
  ],
};
