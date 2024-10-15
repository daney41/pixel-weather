import React from 'react';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import * as ColorScheme from '@/constants/ColorScheme'

// GradientTheme component
const GradientTheme = ({ children }) => {
    return (
        <LinearGradient
            colors={[ColorScheme.TOP_COLOUR, ColorScheme.BOTTOM_COLOUR]} // Gradient effect
            style={{ flex: 1 }}
        >
            {children}
        </LinearGradient>
    );
};

GradientTheme.propTypes = {
    children: PropTypes.node.isRequired,
};

export default GradientTheme;