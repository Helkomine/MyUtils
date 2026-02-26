/*
    function _executeSelector(bytes4 selector, bytes calldata param) internal returns (bool success, bytes memory output) {         
    }

if (selector == CONTRACT_INDEX) {
            (bytes calldata commands, bytes[] calldata inputs) = param.decode();

            

            
        } else {
            (bytes calldata args0, bytes[] calldata args1) = param.decode();
            // Lấy facet
            FacetCall storage facet = facetsAndHooks[selector];
            // Không cho phép facet là địa chỉ mặc định
            if (facet.facetOrHook != address(0)) revert FacetIsZeroAddress();

            // Không khóa entry point vì delegatecall có thể sửa đổi bộ nhớ nên không có gì đảm bảo tính bất biến 
            // Áp dụng giả định tin tưởng vào hợp đồng facet   
            if (facet.callOption == CallOptions.Call) {
                (success, output) = facet.facetOrHook.call(abi.encodeCall(IMSABaseRouter.execute, (args0, args1)));
            } else if (facet.callOption == CallOptions.DelegateCall) {
                (success, output) = facet.facetOrHook.delegatecall(abi.encodeCall(IMSABaseRouter.execute, (args0, args1)));
            } else if (facet.callOption == CallOptions.StaticCall) {
                (success, output) = facet.facetOrHook.staticcall(abi.encodeCall(IMSABaseRouter.execute, (args0, args1)));
            } else {
                revert InvalidOptionCall(facet.callOption);
            }
        } 

        for (uint256 selectorIndex = 0 ; selectorIndex < numSelectors ; ) {



        }
 uint256 numSelectors = selectors.length >> 2;
        if (numSelectors >= type(uint32).max) revert TooManySelectors();
        if (params.length != numSelectors) revert LengthMismatch();

unchecked {
                bytes4 selectorType = bytes4(selectors[selectorIndex << 2 : selectorIndex << 2 + 4]);

                (bool revertIfExecSelectorFailed, bytes4 selector) = selectorType._getFlagAndSelector();

                bytes calldata param = params[selectorIndex];

                (success, output) = _executeSelector(selector, param);

                if (!success && revertIfExecSelectorFailed) {
                    revert ExecutionContractsFailed(selectorIndex, output);
                }
                
                outputs[selectorIndex] = output;

                ++selectorIndex;
            }
*/
