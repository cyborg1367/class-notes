import React from 'react';
import { ShellModel } from './shell-model';

export function SiteFooter({ model }: { model: ShellModel }) {
  return (
    <div className="shell">
      <a className="brand" href={model.home}>دفتر کلاس</a>
      <p>یادداشت‌ها، تمرین‌ها و آزمون‌های کلاس‌های مسعود آهنگری</p>
      <p lang="en" dir="ltr">Masoud Ahangary · Class Notes</p>
    </div>
  );
}
