// Mock for @gorhom/bottom-sheet
export const BottomSheetModal = ({ children }: { children: React.ReactNode }) =>
  children;
export const BottomSheetModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetView = ({ children }: { children: React.ReactNode }) =>
  children;
export const BottomSheetScrollView = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetFlatList = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetTextInput = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetBackdrop = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetHandle = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetFooter = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetOverlay = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetPortal = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetRoot = ({ children }: { children: React.ReactNode }) =>
  children;
export const BottomSheetSectionList = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const BottomSheetVirtualizedList = ({
  children,
}: {
  children: React.ReactNode;
}) => children;

// Mock useBottomSheetModal hook
export const useBottomSheetModal = () => ({
  dismiss: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
  close: jest.fn(),
  snapToIndex: jest.fn(),
  snapToPosition: jest.fn(),
});

// Mock useBottomSheetDynamicSnapPoints hook
export const useBottomSheetDynamicSnapPoints = () => ({
  animatedHandleHeight: { value: 0 },
  animatedSnapPoints: { value: ['25%', '50%', '90%'] },
  animatedContentHeight: { value: 0 },
  handleContentLayout: jest.fn(),
});

// Mock useBottomSheet hook
export const useBottomSheet = () => ({
  index: 0,
  animatedIndex: { value: 0 },
  animatedPosition: { value: 0 },
  animatedSnapPoints: { value: ['25%', '50%', '90%'] },
  animatedHandleHeight: { value: 0 },
  animatedContentHeight: { value: 0 },
  animatedFooterHeight: { value: 0 },
  snapToIndex: jest.fn(),
  snapToPosition: jest.fn(),
  expand: jest.fn(),
  collapse: jest.fn(),
  close: jest.fn(),
  dismiss: jest.fn(),
});
