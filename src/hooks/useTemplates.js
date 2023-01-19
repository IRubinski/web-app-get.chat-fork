import React, { useEffect, useRef } from 'react';
import { ApplicationContext } from '@src/contexts/ApplicationContext';
import TemplatesResponse from '@src/api/responses/TemplatesResponse';
import { setTemplates } from '@src/store/reducers/templatesReducer';
import { useDispatch } from 'react-redux';
import { generateCancelToken } from '@src/helpers/ApiHelper';
import { setIsRefreshingTemplates } from '@src/store/reducers/isRefreshingTemplatesReducer';

const MAX_RETRY = 15;
const RETRY_DELAY = 1000;

const useTemplates = () => {
	// noinspection JSCheckFunctionSignatures
	const { apiService } = React.useContext(ApplicationContext);

	const dispatch = useDispatch();

	const retryCount = useRef(0);

	const cancelTokenSourceRef = useRef();

	useEffect(() => {
		// Generate a token
		cancelTokenSourceRef.current = generateCancelToken();

		return () => {
			// Cancelling ongoing requests
			cancelTokenSourceRef.current.cancel();
		};
	}, []);

	const issueTemplateRefreshRequest = async () => {
		dispatch(setIsRefreshingTemplates(true));

		await apiService.issueTemplateRefreshRequestCall(
			cancelTokenSourceRef.current.token,
			() => {
				checkTemplateRefreshStatus();

				console.log('Issued a template refresh request.');
			},
			(error) => {
				console.log(error);

				console.log('Failed to issue a template refresh request.');
				dispatch(setIsRefreshingTemplates(false));
			}
		);
	};

	const checkTemplateRefreshStatus = async () => {
		console.log('Checking template refresh status...');

		await apiService.checkTemplateRefreshStatusCall(
			cancelTokenSourceRef.current.token,
			(response) => {
				// noinspection JSUnresolvedVariable
				if (response.data?.currently_refreshing === false) {
					console.log('Templates are ready to be loaded.');

					retryCount.current = 0;
					listTemplates(true);
				} else {
					console.log('Templates are still being refreshed.');

					if (retryCount.current < MAX_RETRY) {
						console.log('Retrying...');

						retryCount.current = retryCount.current + 1;

						setTimeout(() => {
							checkTemplateRefreshStatus();
						}, RETRY_DELAY);
					} else {
						console.log('Too many attempts to refresh templates!');
						dispatch(setIsRefreshingTemplates(false));

						window.displayCustomError(
							'Too many attempts to refresh templates! Please try again later.'
						);
					}
				}
			},
			(error) => {
				console.log(error);
				dispatch(setIsRefreshingTemplates(false));
			}
		);
	};

	const listTemplates = async (displaySuccessOnUI) => {
		await apiService.listTemplatesCall(
			cancelTokenSourceRef.current.token,
			(response) => {
				console.log('Loaded templates successfully!');

				const templatesResponse = new TemplatesResponse(response.data);
				dispatch(setTemplates(templatesResponse.templates));
				dispatch(setIsRefreshingTemplates(false));

				if (displaySuccessOnUI) {
					window.displaySuccess('Templates are refreshed successfully.');
				}
			},
			(error) => {
				console.log(error);
				console.log('Failed to load templates.');
				dispatch(setIsRefreshingTemplates(false));
			}
		);
	};

	return {
		issueTemplateRefreshRequest,
		listTemplates,
	};
};

export default useTemplates;
