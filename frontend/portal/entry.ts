import { startPortal } from './application.mjs';
import { portalEscape, portalInline, portalBlankValue, portalBlankError, portalBlankHelp } from './quiz-format';
import { portalFigure } from './quiz-figure.mjs';
import { portalReturn, portalConfig, portalLabEndpoint } from './services/config';
import { portalCreateScriptLoader } from './services/scripts';
import { portalCreateReadCoordinator } from './services/requests';
import { portalCreatePublicConfigLoader, createPublicConfiguration } from './services/public-config';
import { portalMissingBootstrap, createClassroomBootstrap, createClassroomTransport } from './services/classroom';
import { portalAbortable, portalDeadline } from './services/async';
import { connectAuthProvider, createAuthSession } from './services/auth';
import { createPageLifecycle } from './services/routes';

// The build's classic bundle footer preserves the existing Node helper API.
// Browser initialization keeps the existing bounded async boot promise.
export {
  portalEscape, portalInline, portalReturn, portalConfig, portalLabEndpoint, portalCreateScriptLoader,
  portalFigure, portalBlankValue, portalBlankError, portalBlankHelp, portalCreateReadCoordinator,
  portalCreatePublicConfigLoader, portalMissingBootstrap, portalAbortable, portalDeadline,
  createPublicConfiguration, createClassroomBootstrap, createClassroomTransport, connectAuthProvider, createAuthSession, createPageLifecycle,
};
if (typeof document !== 'undefined') startPortal();
