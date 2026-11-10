import React from 'react';
import type { PublicCourse } from '../catalog/types';
import type { HomeChannel } from './contracts';
import { HomeHero } from './HomeHero';
import { PublishedCourses } from './PublishedCourses';
import { LearningMethod, InstructorTeaser, DashboardCallout } from './HomeSections';

export function HomePage({ catalog, channel, version = 'build' }: {
  catalog: readonly PublicCourse[];
  channel: HomeChannel;
  version?: string;
}) {
  return <>
    <HomeHero channel={channel} />
    <PublishedCourses catalog={catalog} version={version} />
    <LearningMethod />
    <InstructorTeaser />
    <DashboardCallout />
  </>;
}
