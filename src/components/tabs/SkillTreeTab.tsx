import React from 'react';
import { SkillTreeContainer } from '../skilltree/SkillTreeContainer';

export const SkillTreeTab: React.FC = () => {
  return (
    <div className="tab-content">
      <div className="tab-header">
        <h2>⚛️ Skill Tree</h2>
        <p className="tab-description">
          Unlock powerful upgrades by following the tech tree. Some upgrades require prerequisites!
        </p>
      </div>
      <SkillTreeContainer />
    </div>
  );
};
