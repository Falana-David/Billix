import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const ranges = [
  { range: [300, 579], color: '#FF0000', label: 'Poor' },
  { range: [580, 669], color: '#FFA500', label: 'Fair' },
  { range: [670, 739], color: '#FFFF00', label: 'Good' },
  { range: [740, 799], color: '#228B22', label: 'Very Good' }, // Changed to a more subtle green
  { range: [800, 850], color: '#0000FF', label: 'Excellent' },
];

const getRangeColor = (score) => {
  for (const range of ranges) {
    if (score >= range.range[0] && score <= range.range[1]) {
      return range.color;
    }
  }
  return '#000000'; // Default color if no range is matched
};

const FinancialHealthScoreModal = ({ visible, setVisible, scale, opacity, barChartData }) => {
  const score = 750; // Example score
  const chartColor = getRangeColor(score);

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Financial Health Score Details</Text>
          <Text style={styles.text}>Current Score: {score}</Text>
          <Text style={styles.text}>Score Breakdown: 40% Savings, 30% Expenses, 30% Investments</Text>
          <Text style={styles.text}>Improvement Tips: Reduce unnecessary expenses, increase savings rate</Text>
          <Animated.View style={{ transform: [{ scale }], opacity }}>
            <BarChart
              data={barChartData}
              width={screenWidth - 80} // Adjusted width for modal padding
              height={220}
              chartConfig={{
                backgroundColor: '#1cc910',
                backgroundGradientFrom: '#eff3ff',
                backgroundGradientTo: '#efefef',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </Animated.View>
          <View style={styles.rangesContainer}>
            {ranges.map((range) => (
              <View key={range.label} style={styles.rangeItem}>
                <View style={[styles.colorBox, { backgroundColor: range.color }]} />
                <Text style={styles.rangeLabel}>{range.label}: {range.range[0]}-{range.range[1]}</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={setVisible}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  rangesContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  rangeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  colorBox: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  rangeLabel: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#5fa052',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default FinancialHealthScoreModal;
