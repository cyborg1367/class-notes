const version=new URL(import.meta.url).search;
const [{getViewChannel},{INITIAL_COURSE_VIEW,projectCourseView}]=await Promise.all([
 import(new URL('./view-channel.mjs'+version,import.meta.url)),
 import(new URL('./course-view-model.mjs'+version,import.meta.url)),
]);
export {INITIAL_COURSE_VIEW,projectCourseView};

export function createCourseController({host,course,readContext,links,refresh,requestAccess,isCurrent}) {
  const channel=getViewChannel(host,INITIAL_COURSE_VIEW);
  const owner=readContext().userId||null;
  let disposed=false,busy=null,error='';
  const alive=()=>!disposed&&host.isConnected&&isCurrent()&&(readContext().userId||null)===owner;
  function update(){if(alive())channel.publish({...projectCourseView(course,readContext(),links),busy,error})}
  async function run(action){
    if(!alive()||busy)return false;
    const current=projectCourseView(course,readContext(),links);
    if(action==='request-access'&&current.phase!=='unregistered')return false;
    busy=action;error='';update();
    try{
      if(!alive())return false;
      if(action==='request-access')await requestAccess();
      if(!alive())return false;
      await refresh();
      return alive();
    }catch{if(alive())error='دریافت یا ثبت درخواست کامل نشد؛ دوباره تلاش کن.';return false}
    finally{if(alive()){busy=null;update()}}
  }
  const release=channel.bindActions({'refresh':()=>run('refresh'),'request-access':()=>run('request-access')});
  update();
  return{update,dispose(){if(disposed)return;disposed=true;if(release())channel.reset()}};
}
