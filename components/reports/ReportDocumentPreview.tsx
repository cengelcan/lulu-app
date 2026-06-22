import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { Radius } from '@/constants/theme';
import { generateReportHtml } from '@/services/reports/generate-report-html';
import { REPORT_PAGE_HEIGHT, REPORT_PAGE_WIDTH } from '@/services/reports/html/report-layout';
import { REPORT_SCREEN_PAGE_GAP } from '@/services/reports/html/report-styles';
import { paginateReportContent } from '@/services/reports/paginate-report-pages';
import type {
  ReportDocumentLabels,
  ReportPetSummary,
  ReportPreviewContent,
  ReportSummary,
} from '@/types/report';

type ReportDocumentPreviewProps = {
  pet: ReportPetSummary;
  content: ReportPreviewContent;
  labels: ReportDocumentLabels;
  formatDate: (date: string) => string;
  generatedAtLabel: string;
  formatPageLabel: (current: number, total: number) => string;
  primaryColor: string;
  photoDataUri?: string | null;
  qrCodeDataUri?: string | null;
  summary?: ReportSummary | null;
};

/** Posts the rendered document height (in 612px-viewport CSS pixels) back to RN. */
const HEIGHT_REPORTER = `
  (function () {
    function report() {
      var height = document.body ? document.body.scrollHeight : 0;
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(String(height));
      }
    }
    report();
    window.addEventListener('load', report);
    setTimeout(report, 250);
    setTimeout(report, 800);
  })();
  true;
`;

export function ReportDocumentPreview({
  pet,
  content,
  labels,
  formatDate,
  generatedAtLabel,
  formatPageLabel,
  primaryColor,
  photoDataUri = null,
  qrCodeDataUri = null,
  summary = null,
}: ReportDocumentPreviewProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const hasSummary = Boolean(summary && summary.lines.length > 0);

  const totalPages = useMemo(
    () => paginateReportContent(content, { hasSummary }).length,
    [content, hasSummary]
  );

  const estimatedContentHeight = useMemo(
    () => totalPages * REPORT_PAGE_HEIGHT + Math.max(0, totalPages - 1) * REPORT_SCREEN_PAGE_GAP,
    [totalPages]
  );

  const [measuredContentHeight, setMeasuredContentHeight] = useState<number | null>(null);

  const html = useMemo(
    () =>
      generateReportHtml({
        pet,
        content,
        labels,
        formatDate,
        generatedAtLabel,
        formatPageLabel,
        photoDataUri,
        qrCodeDataUri,
        primaryColor,
        summary,
        mode: 'screen',
      }),
    [
      content,
      formatDate,
      formatPageLabel,
      generatedAtLabel,
      labels,
      pet,
      photoDataUri,
      primaryColor,
      qrCodeDataUri,
      summary,
    ]
  );

  const scale = containerWidth > 0 ? containerWidth / REPORT_PAGE_WIDTH : 0;
  const contentHeight = measuredContentHeight ?? estimatedContentHeight;
  const scaledHeight = scale > 0 ? Math.ceil(contentHeight * scale) : 0;

  const handleLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && Math.abs(width - containerWidth) > 0.5) {
      setContainerWidth(width);
    }
  };

  const handleMessage = (event: WebViewMessageEvent) => {
    const next = Number(event.nativeEvent.data);
    if (Number.isFinite(next) && next > 0 && next !== measuredContentHeight) {
      setMeasuredContentHeight(next);
    }
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {scale > 0 ? (
        <View style={{ height: scaledHeight, overflow: 'hidden' }}>
          <View
            style={{
              width: REPORT_PAGE_WIDTH,
              height: contentHeight,
              transform: [{ scale }],
              transformOrigin: 'top left',
            }}>
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={{ width: REPORT_PAGE_WIDTH, height: contentHeight, backgroundColor: 'transparent' }}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              injectedJavaScript={HEIGHT_REPORTER}
              onMessage={handleMessage}
              androidLayerType="software"
              setBuiltInZoomControls={false}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: '#e5e7eb',
  },
});
