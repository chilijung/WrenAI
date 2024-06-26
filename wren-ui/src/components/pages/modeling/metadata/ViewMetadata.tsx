import { Button, Typography } from 'antd';
import CodeBlock from '@/components/editor/CodeBlock';
import PreviewData from '@/components/dataPreview/PreviewData';
import { DiagramView } from '@/utils/data';
import { usePreviewViewDataMutation } from '@/apollo/client/graphql/view.generated';

export type Props = DiagramView;

export default function ViewMetadata(props: Props) {
  const { referenceName, statement, viewId } = props || {};

  const [previewViewDataMutation, previewViewDataResult] =
    usePreviewViewDataMutation({
      onError: (error) => console.error(error),
    });

  const onPreviewData = () => {
    previewViewDataMutation({
      variables: { where: { id: viewId } },
    });
  };

  return (
    <>
      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">Name</Typography.Text>
        <div>{referenceName || '-'}</div>
      </div>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          SQL statement
        </Typography.Text>
        <CodeBlock code={statement} showLineNumbers maxHeight="300" />
      </div>

      <div className="mb-6">
        <Typography.Text className="d-block gray-7 mb-2">
          Data preview (100 rows)
        </Typography.Text>
        <Button onClick={onPreviewData} loading={previewViewDataResult.loading}>
          Preview data
        </Button>
        <div className="my-3">
          <PreviewData
            {...{
              error: previewViewDataResult.error,
              loading: previewViewDataResult.loading,
              previewData: previewViewDataResult?.data?.previewViewData,
            }}
          />
        </div>
      </div>
    </>
  );
}
