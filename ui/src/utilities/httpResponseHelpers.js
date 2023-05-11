export function getAxiosCatchMessage(status) {
    if (status === 200 || status === 201) {
        return 'The action was successful.';
    } else if (status === 400) {
        return 'Oops!  Looks like what is being sent to the server is incorrect.';
    } else if (status === 401) {
        return 'You are not authorized to perform this action.';
    } else if (status === 403) {
        return 'You are not authorized to perform this action.';
    } else if (status === 419) {
        return 'The session has timed out.  Please reload refresh the page and try again.';
    } else if (status === 422) {
        return 'Please correct the information and re submit.';
    } else {
        return 'Oops!  Sorry, an error has occurred.  We\'ve been notified and will endeavor to resolve it.';
    }
}

export function handleAxiosCatch(error) {
    if (error.response) {
        return { "status": error.response.status, "data": error.response.data.errorResponse };
    } else {
        return { "status": -1, "data": { "message": "some other error - maybe a network issue" } };
    }
}