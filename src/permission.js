import router from './router'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken,removeToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/auth-redirect'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
    // start progress bar
    NProgress.start()
    
    document.title = getPageTitle(to.meta.title)
    const hasToken = getToken()
    if (!hasToken) {
        if(to.path === '/login'){
            next();
        }else{
            next(`/login?redirect=${to.path}`);
        }
    }else{
        if(to.path === '/login'){
            next({ path: '/' });
        }else{
            next();
        }
    }
})

router.afterEach(() => {
    NProgress.done()
})
