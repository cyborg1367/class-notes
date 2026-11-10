export async function saveBeforeSignOut({ save, confirm, isCurrent, signOut, timeout = 8000 }) {
    let timer, result;
    try {
        result = await Promise.race([Promise.resolve().then(save), new Promise(resolve => { timer = setTimeout(() => resolve({ saved: false }), timeout); })]);
    }
    catch {
        result = { saved: false };
    }
    finally {
        clearTimeout(timer);
    }
    if (!isCurrent())
        return false;
    if (result?.saved === false && !await confirm(result))
        return false;
    if (!isCurrent())
        return false;
    const { error } = await signOut();
    if (error)
        throw error;
    return true;
}
