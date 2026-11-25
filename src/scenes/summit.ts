import type { SceneBuilder } from '../core/stage';
import * as THREE from 'three';
import { themes } from '../content';
import { quizParts } from '../content/quiz';
import { store } from '../core/state';
import { h } from '../shared/dom';
import { base, box, cone, cylinder, group } from './toon';

const BLOCK = 0.62;
const EMPTY = '#e4ded0';
const MISSED = '#c3c0b8';

export const summit: SceneBuilder = (ctx) => {
  const { root } = ctx;
  root.add(base(12.4, 4.8, '#cfe0d6'));
  const columns = quizParts.map((part, i) => {
    const x = (i - 2.5) * 1.95;
    const color = themes[part.theme - 1].card;
    root.add(box(1.5, 0.18, 1.5, color, x, 0, 0));
    const blocks = part.questions.map((question, n) => {
      const block = box(1.15, BLOCK - 0.07, 1.15, EMPTY, x, 0.2 + n * BLOCK, 0);
      root.add(block);
      ctx.pop(block, i + n * 0.8);
      return { question, block };
    });
    const flag = group(x, 0.2 + 5 * BLOCK, 0, cylinder(0.04, 0.04, 0.9, '#6b4a35'), cone(0.28, 0.5, '#e5b23c', 0.2, 0.55, 0, 4));
    flag.children[1].rotation.z = -Math.PI / 2;
    flag.visible = false;
    root.add(flag);
    ctx.label(new THREE.Vector3(x, 0.05, 1.5), `Theme ${part.theme}`, { lift: -0.55 });
    return { color, blocks, flag };
  });

  ctx.onFrame(() => {
    const { answers, submitted } = store.quiz;
    for (const column of columns) {
      let correct = 0;
      for (const { question, block } of column.blocks) {
        const answered = answers[question.n] !== undefined;
        const right = answers[question.n] === question.answer;
        if (right) correct++;
        const material = block.material as THREE.MeshStandardMaterial;
        material.color.set(submitted ? (right ? column.color : MISSED) : answered ? column.color : EMPTY);
        const small = submitted && !right;
        block.scale.x = block.scale.z = small ? 0.62 : 1;
      }
      column.flag.visible = submitted && correct === column.blocks.length;
    }
  });

  ctx.panel.append(
    h('p', null, 'Each block is one question. It takes the theme colour when you answer.'),
    h('p', { class: 'hint' }, 'After you submit, correct answers stay wide and coloured. A flag marks a topic with 5 out of 5.'),
  );
  ctx.view([0, 6, 15.4], [0, 1.4, 0], true);
};
