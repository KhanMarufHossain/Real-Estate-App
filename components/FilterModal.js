import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { wp, hp, rs } from '../utils/responsive';
import {
  UNIT_TYPES,
  UNIT_BEDROOMS,
  STATUS_OPTIONS,
  SALE_STATUS_OPTIONS,
  PRICE_RANGES,
  AREA_RANGES,
} from '../constants/filterOptions';

export default function FilterModal({ visible, onClose, onApply, initialFilters = {} }) {
  const [filters, setFilters] = useState({
    unit_types: initialFilters.unit_types || '',
    unit_bedrooms: initialFilters.unit_bedrooms || '',
    status: initialFilters.status || '',
    sale_status: initialFilters.sale_status || '',
    priceRange: initialFilters.priceRange || { label: 'Any Price', min: null, max: null },
    areaRange: initialFilters.areaRange || { label: 'Any Area', min: null, max: null },
  });

  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSelect = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: prev[field] === value ? '' : value
    }));
  };

  const handlePriceRangeSelect = (range) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const handleAreaRangeSelect = (range) => {
    setFilters(prev => ({
      ...prev,
      areaRange: range
    }));
  };

  const handleReset = () => {
    setFilters({
      unit_types: '',
      unit_bedrooms: '',
      status: '',
      sale_status: '',
      priceRange: { label: 'Any Price', min: null, max: null },
      areaRange: { label: 'Any Area', min: null, max: null },
    });
    setExpandedSection(null);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const renderDropdown = (title, items, field, selectedValue) => {
    const isExpanded = expandedSection === field;
    
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleSection(field)}
        >
          <Text style={styles.dropdownTitle}>{title}</Text>
          <Text style={styles.selectedValue}>
            {selectedValue || 'Any'}
          </Text>
          <Text style={styles.dropdownArrow}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            <TouchableOpacity
              style={[styles.dropdownItem, !selectedValue && styles.dropdownItemSelected]}
              onPress={() => handleSelect(field, '')}
            >
              <Text style={[styles.dropdownItemText, !selectedValue && styles.dropdownItemTextSelected]}>
                Any
              </Text>
            </TouchableOpacity>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.dropdownItem, selectedValue === item && styles.dropdownItemSelected]}
                onPress={() => {
                  handleSelect(field, item);
                  setExpandedSection(null);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedValue === item && styles.dropdownItemTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderRangeDropdown = (title, ranges, selectedRange, onSelect, field) => {
    const isExpanded = expandedSection === field;
    
    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownHeader}
          onPress={() => toggleSection(field)}
        >
          <Text style={styles.dropdownTitle}>{title}</Text>
          <Text style={styles.selectedValue}>
            {selectedRange.label}
          </Text>
          <Text style={styles.dropdownArrow}>{isExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        
        {isExpanded && (
          <ScrollView style={styles.dropdownList} nestedScrollEnabled>
            {ranges.map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedRange.label === range.label && styles.dropdownItemSelected
                ]}
                onPress={() => {
                  onSelect(range);
                  setExpandedSection(null);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedRange.label === range.label && styles.dropdownItemTextSelected
                  ]}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.resetButton}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Options */}
          <ScrollView style={styles.filterScroll} showsVerticalScrollIndicator={false}>
            {renderDropdown('Property Type', UNIT_TYPES, 'unit_types', filters.unit_types)}
            {renderDropdown('Bedrooms', UNIT_BEDROOMS, 'unit_bedrooms', filters.unit_bedrooms)}
            {renderDropdown('Status', STATUS_OPTIONS, 'status', filters.status)}
            {renderDropdown('Sale Status', SALE_STATUS_OPTIONS, 'sale_status', filters.sale_status)}
            {renderRangeDropdown('Price Range', PRICE_RANGES, filters.priceRange, handlePriceRangeSelect, 'priceRange')}
            {renderRangeDropdown('Area Range', AREA_RANGES, filters.areaRange, handleAreaRangeSelect, 'areaRange')}
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    maxHeight: hp(85),
    paddingBottom: hp(2),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    fontSize: rs(24),
    color: '#1A1A1A',
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: rs(18),
    fontWeight: '700',
    color: '#1A1A1A',
  },
  resetButton: {
    fontSize: rs(14),
    color: '#2EBFA5',
    fontWeight: '600',
  },
  filterScroll: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  dropdownContainer: {
    marginBottom: hp(2),
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderRadius: rs(8),
  },
  dropdownTitle: {
    fontSize: rs(14),
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  selectedValue: {
    fontSize: rs(13),
    color: '#2EBFA5',
    marginRight: wp(2),
    flex: 1,
    textAlign: 'right',
  },
  dropdownArrow: {
    fontSize: rs(12),
    color: '#757575',
  },
  dropdownList: {
    maxHeight: hp(30),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: rs(8),
    marginTop: hp(1),
  },
  dropdownItem: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  dropdownItemSelected: {
    backgroundColor: '#E8F8F5',
  },
  dropdownItemText: {
    fontSize: rs(13),
    color: '#1A1A1A',
  },
  dropdownItemTextSelected: {
    color: '#2EBFA5',
    fontWeight: '600',
  },
  modalFooter: {
    paddingHorizontal: wp(5),
    paddingTop: hp(2),
  },
  applyButton: {
    backgroundColor: '#2EBFA5',
    paddingVertical: hp(1.8),
    borderRadius: rs(12),
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: rs(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
