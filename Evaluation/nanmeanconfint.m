% [M,C]=confint(A, proz, dim)
% A: Sample
% proz: confidence, (only 0.9)
% dim: Dimension, in der die Samples gehen
% M= mean
% c= proz-confidence interval
function [M,C]=nanmeanConfInt(A, proz, dim)
if nargin==1
    proz=0.95;
    dim=ndims(A);
elseif nargin==2
    dim=ndims(A);
end

runs=size(A,dim);

% es ist zwar in Ordnung die Nans rauszulassen um Werte zu kriegen, aber
% den Conf-Ints ist dann halt nicht mehr soo recht zu trauen...
M=nanmean(A,dim);
H=ones(1,ndims(A));
H(dim)=runs;
if runs >1
    %V=sum((A-repmat(M,H)).^2,dim)/(runs-1);
    V=sum((A(~isnan(A))-repmat(M,prod(H)-sum(isnan(A)),1)).^2,dim)/(runs-1);
    C=tinv(1-(1-proz)/2,(runs-1))*sqrt(V/runs);
else
     C = 0;
 end


