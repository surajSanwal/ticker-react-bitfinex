import React, { ReactNode } from 'react';
import { Gradient as ReactGradient } from 'react-gradient';

const gradients = [
  ['#bd19d6', '#ea7d10'],
  ['#ff2121', '#25c668'],
];

interface Props {
  colors?: string[];
  children?: ReactNode;
}
const Gradient: React.FC<Props> = props => {
  return (
    <ReactGradient
      gradients={props.colors || gradients}
      property="background"
      duration={3000}
      angle="45deg"
    >
      {props.children}
    </ReactGradient>
  );
};

export default Gradient;
