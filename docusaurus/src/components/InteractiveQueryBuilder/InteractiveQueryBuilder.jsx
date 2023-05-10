import qs from 'qs';
import clsx from 'clsx';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { LiveEditor, LiveError, LivePreview, LiveProvider } from 'react-live';
import { usePrismTheme } from '@docusaurus/theme-common';
import { Button } from '../Button/Button';
import { FormField } from '../Form';
import styles from './interactive-query-builder.module.scss';

export function InteractiveQueryBuilder({
  className,
  code = '',
  endpoint: inheritEndpoint = '/api/books',
  id: inheritId = '',
}) {
  const id = (inheritId || `strapi-iqb-${Math.random()}`);
  const localStorageKey = `strapi-iqb-value-for-${inheritEndpoint}`;
  const prismTheme = usePrismTheme();
  const [endpoint, setEndpoint] = useState(inheritEndpoint);

  const handleEndpointChange = useCallback((evt) => {
    setEndpoint(evt.target.value);
    localStorage.setItem(localStorageKey, evt.target.value);
  }, [localStorageKey]);

  useLayoutEffect(() => {
    const endpointChangedBeforeByUser = localStorage.getItem(localStorageKey);

    if (!endpointChangedBeforeByUser) {
      return;
    }

    setEndpoint(endpointChangedBeforeByUser);
  }, [localStorageKey]);

  return (
    <form
      onSubmit={(evt) => evt.preventDefault()}
      className={clsx(styles.iqb, className)}
    >
      <LiveProvider
        language="javascript"
        theme={prismTheme}
        code={code.trim()}
        scope={{
          endpoint,
          id,
          qs,
          Button,
          FormField,
        }}
        transformCode={(writtenQueryByUser) =>
          `() => {
            const queryObject =


  ${writtenQueryByUser}


            ;

            const queryStringified = (
              endpoint +
              '?' +
              qs.stringify(queryObject, { encodeValuesOnly: true })
            );

            return (
              <>
                <FormField
                  id={id + '-result'}
                  label="Query String URL:"
                  input={{
                    'aria-disabled': true,
                    readOnly: true,
                    value: queryStringified,
                  }}
                />
                <Button
                  id={id + '-copy-to-clipboard'}
                  type="button"
                  onClick={() => navigator.clipboard.writeText(queryStringified)}
                >
                  Copy to clipboard
                </Button>
              </>
            );
          }`
        }
      >
        <FormField
          id={`${id}-endpoint`}
          label="Endpoint:"
          input={{
            value: endpoint,
            onChange: handleEndpointChange,
          }}
        />
        <FormField
          id={`${id}-query`}
          label="Endpoint Query Parameters:"
        >
          <LiveEditor className={clsx(styles.iqb__editor)} />
        </FormField>
        <LiveError />
        <LivePreview />
      </LiveProvider>
    </form>
  );
}
