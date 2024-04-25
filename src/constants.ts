import { SetMetadata } from '@nestjs/common';

export const API_TOKEN =
  'y8WlGioq7br6pxrlafCepb0y2DYJDZt1E3cs3QbuHL2F3b7FQ40j3RuUIgh9HR5xUfmQv30p5AiCyUysisE05lHw4ZLwSKVf6Pa0';

export const API_URL = 'http://94.130.69.82/cgi-bin/timetable.cgi';
export const APPLE_REVIEW_EMAIL = 'applereview';
export const APPLE_REVIEW_CODE = '000000';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
